from flask import Flask, request

#from random import choice
from keras.saving.save import load_model
from numpy import load
from numpy import expand_dims
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import Normalizer
from sklearn.svm import SVC
from matplotlib import pyplot
from os import listdir
from os.path import isdir
from PIL import Image
from matplotlib import pyplot
from numpy import savez_compressed
from numpy import asarray
from mtcnn.mtcnn import MTCNN
from tensorflow.keras.models import load_model
import os
import numpy as np
import cv2
import dlib
# import pygame 
# import time

app = Flask(__name__)


# localhost:5000/flask로 접속 시 Flask server 출력됨
# node js 서버에서 127.0.0.1:5000/flask로 접속
# python -m flask run 으로 터미널에서 실행 가능

# pygame.mixer.init() # 소리를 낼 수 있게 해준다.
# pygame.mixer.music.load('audio/fire-truck.wav')   # 소방차 경보음으로 설정해준다.


RIGHT_EYE = list(range(36, 42))
LEFT_EYE = list(range(42, 48))
MOUTH = list(range(48, 68))
NOSE = list(range(27, 36))
EYEBROWS = list(range(17, 27))  # 눈썹
JAWLINE = list(range(0, 17))    # 턱선
ALL = list(range(0, 68))
EYES = list(range(36, 48))

# 비디오 캠에서 나타나는 frame의 크기를 고정시킨다.
frame_width = 640
frame_height = 480

#title_name = 'Face Drowsiness Detection'
elapsed_time = 0    # 측정 시간

# 얼굴 인식 방법 : haar cascade 방식(빠르지만 매우 정확하진 않다.)
face_cascade_name = 'haarcascades/haarcascade_frontalface_alt.xml'

# 객체 생성
face_cascade = cv2.CascadeClassifier()


# load해서 얼굴을 식별 할 수 있게 해준다.
if not face_cascade.load(cv2.samples.findFile(face_cascade_name)):
    print('--(!)Error loading face cascade')
    exit(0)

# 얼굴의 68개의 점을 찾아준다.
predictor_file = 'model/shape_predictor_68_face_landmarks.dat'
predictor = dlib.shape_predictor(predictor_file)

status = 'Awake'
number_closed = 0    # 눈 감은 횟수
min_EAR = 0.27
closed_limit = 1    # 2번 이상 눈을 감으면 존 걸로 간주한다.
show_frame = None
sign = None
color = None

# 유클리드 거리 계산하는 공식을 이용하여 EAR을 구해준다.
def getEAR(points):
    A = np.linalg.norm(points[1] - points[5])
    B = np.linalg.norm(points[2] - points[4])
    C = np.linalg.norm(points[0] - points[3])
    return (A + B) / (2.0 * C)

def detectAndDisplay(image):    # image : 하나하나의 동영상 이미지를 받아온다.
    result = "0"    # 0 : 졸고있지 않다. 1 : 졸고있다. 2: 얼굴을 detect 하지 못했다.
    IsFace = "1"    # 1 : 얼굴 detect 성공

    # global 변수 : 전체 프로그램에서 공유하는 변수들이다.
    global number_closed
    global color
    global show_frame
    global sign
    global elapsed_time

    # 시작하는 시간 입력해준다.
    # start_time = time.time()
    #height,width = image.shape[:2]
    # image = cv2.resize(image, (frame_width, frame_height))

    # 졸고 있지 않을 때는 컬러 화면을 띄어주고
    show_frame = image
    
    # 졸고 있을 때는 회색 화면을 띄어주기 위해서
    frame_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 분석을 편하게 하기 위해서 즉, 노이즈를 없애주기 위해서
    # equalizeHist()를 사용하여 필터링을 해준다. 
    frame_gray = cv2.equalizeHist(frame_gray)

    # 얼굴들을 찾아주게된다.
    faces = face_cascade.detectMultiScale(frame_gray)

    x=0
    y=0
    w=0
    h=0
    max_area=0

    for (temp_x,temp_y,temp_w,temp_h) in faces:
        if max_area<temp_w*temp_h:
            x=temp_x
            y=temp_y
            w=temp_w
            h=temp_h
            max_area=temp_w*temp_h
            
    # 녹색 사각형을 그려준다.
    #cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

    # 좌표들을 dlib에서 사용하는 좌표 체계로 만들어서 rect에 넣어준다.
    rect = dlib.rectangle(int(x), int(y), int(x + w),
			int(y + h))

    # 좌표들을 배열로 만들어준다.
    points = np.matrix([[p.x, p.y] for p in predictor(frame_gray, rect).parts()])

    # 눈에 해당하는 좌표들만 가져온다.
    show_parts = points[EYES]

    # 오른쪽 눈의 EAR를 구해준다.
    right_eye_EAR = getEAR(points[RIGHT_EYE])
        
    # 왼쪽 눈의 EAR를 구해준다.
    left_eye_EAR = getEAR(points[LEFT_EYE])

    # 오른쪽 눈과 왼쪽 눈의 EAR값의 평균을 구해준다.
    # mean_eye_EAR = (right_eye_EAR + left_eye_EAR) / 2 

    # 각 두 눈의 중앙 지점을 찾아준다. 그리고 int형으로 바꿔준다.
    right_eye_center = np.mean(points[RIGHT_EYE], axis = 0).astype("int")
    left_eye_center = np.mean(points[LEFT_EYE], axis = 0).astype("int")

    # 양쪽 눈 밑에 EAR값을 적어준다.
    #cv2.putText(image, "{:.2f}".format(right_eye_EAR), (right_eye_center[0,0], right_eye_center[0,1] + 20),
    #    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    #cv2.putText(image, "{:.2f}".format(left_eye_EAR), (left_eye_center[0,0], left_eye_center[0,1] + 20),
    #    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
    # 눈에 노란색 점을 찍어준다.
    #for (i, point) in enumerate(show_parts):
    #    x = point[0,0]
    #    y = point[0,1]
    #    cv2.circle(image, (x, y), 1, (0, 255, 255), -1)

    # 얼굴이 detect되지 않았을 경우, 눈 감는 횟수를 유지시킨다.
    if len(faces)==0:
        color = (255, 0, 0)     # 파란
        status = 'NoDetect'
        IsFace = "0"
        
    # left_eye_EAR와 right_eye_EAR 둘 다 min_EAR보다 크면 눈을색 뜨고 있다고 간주한다.
    elif left_eye_EAR > min_EAR and right_eye_EAR > min_EAR:
        color = (0, 255, 0)     # 녹색
        status = 'Awake'
        IsFace = "1"
        number_closed = number_closed - 1
        if( number_closed<0 ):    # 계속 줄이면 마이너스가 되기때문에 처리를 해다.
            number_closed = 0
    else:    # mean_eye_EAR가 min_EAR보다 작으면 눈을 감고 있다고 간주한다.
        color = (0, 0, 255)     # 빨간색
        status = 'Sleep'
        IsFace = "1"
        number_closed = number_closed + 1
                     
    sign = status + ', Sleep count : ' + str(number_closed) + ' / ' + str(closed_limit)
    print("number_closed : "+str(number_closed))
    #sign = 'Sleep : '+str(number_closed)
            
    # 눈 감은 횟수가 closed_limit값보다 클 경우
    if( number_closed > closed_limit ):
        show_frame = frame_gray
        # play SOUND
        print("sound")
        result = "1"
        if IsFace=="0":
            result = "2"
        return result
#        if(pygame.mixer.music.get_busy()==False):    # 플레이 되고 있지 않으면
#            #pygame.mixer.music.play()    # 플레이 해준다.
    
    #cv2.putText(show_frame, sign , (10,frame_height-20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    #cv2.imshow(title_name, show_frame)
    #frame_time = time.time() - start_time
    #elapsed_time += frame_time    # 전체 걸린 시간
    # print("Frame time {:.3f} seconds".format(frame_time))
    if IsFace=="0":
        result = "2"

    return result

@app.route('/flask', methods=['GET'])
def wpqkfehlfk():
   return "flask hi"

def extract_face(filename, required_size=(160, 160)):
   # 파일에서 이미지 불러오기
   image = Image.open(filename)
   # RGB로 변환, 필요시
   image = image.convert('RGB')
   # 이미지를 배열로 변환
   pixels = asarray(image)
   # 감지기 생성, 기본 가중치 이용
   detector = MTCNN()
   # 이미지에서 얼굴 감지
   results = detector.detect_faces(pixels)
   # 첫 번째 얼굴에서 경계 상자 추출 : 각 경계 상자- 왼쪽 아래 모서리 위치(x1,y1) 너비(width) 및 높이(height)를 정의
   x1, y1, width, height = results[0]['box']

   # 버그 수정 : 라이브러리가 음의 픽셀 인덱스를 반환하며,좌표값에 절대값을 취하여 버그를 해결함.
   x1, y1 = abs(x1), abs(y1)
   x2, y2 = x1 + width, y1 + height

   # 얼굴 추출
   face = pixels[y1:y2, x1:x2]
   
   # 모델 사이즈(160*160)로 픽셀 재조정
   image = Image.fromarray(face)            #Image.fromarray()함수를 사용하여 배열(앞에서 pixels = asarray(image)를 통해 image가 배열로 바뀌었음)을 PIL 이미지 객체로 다시 변환
   image = image.resize(required_size)      #160*160 사이즈로 재조정
   face_array = asarray(image)                  #image를 다시 배열로 변환
   return face_array

# 디렉토리 안의 모든 이미지를 불러오고 이미지에서 얼굴 추출(extract_face 사용)
def load_faces(directory):
   faces = list()                                    #list로 선언

   # 파일 열거
   for filename in listdir(directory):      #os.listdir() : 지정한 디렉토리내의 모든 파일과 디렉토리 리스트를 리턴한다.
      # 경로
      path = directory + filename               #path가 각각의 하위디렉토리(ex. sohyun,ahyoon,suzy...)로 설정되고,위치한 filename이 for문 돌면서 설정됨.
      # 얼굴 추출
      face = extract_face(path)                  #모든 이미지에 대해 extract_face가 수행되고, 
      # 저장
      faces.append(face)                           #extract_face의 return 값은 face_array 즉, 배열임.그것을 faces 리스트에 저장함.
   return faces   

# 이미지를 포함하는 각 클래스에 대해 하나의 하위 디렉토리가 포함된 데이터셋을 불러오기 - train dataset에만 쓰면됨.
def load_dataset(directory):
   X, y = list(), list()
   # 클래스별로 폴더 열거
   for subdir in listdir(directory):         #directory로 받는게 '../train', '../val' 이기 때문에 그것의 subdir(sohyun,ahyoon,suzy,,,)를 for문으로 돌리기
      # 경로
      path = directory + subdir + '/'
      # 디렉토리에 있을 수 있는 파일을 건너뛰기(디렉토리가 아닌 파일)
      if not isdir(path):
         continue


      # 하위 디렉토리의 모든 얼굴 불러오기
      faces = load_faces(path)
      # 레이블 생성
      labels = [subdir for _ in range(len(faces))]         #하위 디렉토리(ex '.../sohyun')에 있는 이미지 file 수만큼 for문 돌려서 labels 리스트 만듦 ex) ['sohyun','sohyun',...]
      # 진행 상황 요약
      print('>%d개의 데이터를 불러왔습니다. 클래스명: %s' % (len(faces), subdir))
      # 저장
      #list.extend(iterable)는 리스트 끝에 가장 바깥쪽 iterable의 모든 항목을 넣습니다.즉,넣어질 때 리스트의 []꺽쇠가 빼고 넣어진다고 보면 됨.-중첩리스트 방지
      X.extend(faces)
      y.extend(labels)
   return asarray(X), asarray(y)         #리스트를 배열로 바꿈.

def get_embedding(model, face_pixels):
   # 픽셀 값의 척도
   face_pixels = face_pixels.astype('int32')
 
   # 채널 간 픽셀값 표준화
   mean, std = face_pixels.mean(), face_pixels.std()
   face_pixels = (face_pixels - mean) / std

   # 얼굴을 하나의 샘플로 변환
   #numpy.expand_dims는 배열의 axis로 지정된 차원을 추가한다.
   #만약 x.shape=(2,) 일 때, axis=0 으로 설정 하면, (첫번째 축,두번째 축,..) 이기 때문에, x.shape=(1,2)가 된다.
   samples = expand_dims(face_pixels, axis=0)
   # 임베딩을 갖기 위한 예측 생성
   yhat = model.predict(samples)
   #yhat이 이미지의 embedding 값(vector)이 된다.
   return yhat[0]

@app.route('/face_train', methods=['POST'])
def train_data():
   # 훈련 데이터셋 불러오기
   train_path = './image/train/'
   trainX, trainy = load_dataset(train_path)         #load dataset을 통해서 tranX에는 모든 train 사진에 대한 extract_face의 return 값이 배열로 저장돼 있고, 
                                                                        #trainy에는 모든 train 사진에 대한 각각의 label 값들(directory 이름들)이 저장돼 있음
   print(trainX.shape, trainy.shape)                     #trainX.shape : (580,160,160,3) - 580은 전체 train data의 총 갯수고, 160,160은 사이즈, 3은 RGB임을 나타냄.
                                                                        #trainy.shape : (580,) - 모든 사진 580개에 대한 label이 저장돼 있음.
   # 테스트 데이터셋 불러오기
   # test_path = './image/test/'
   # testX, testy = load_dataset(test_path)

   # print(testX.shape, testy.shape)

   # savez_compressed : 여러개의 배열을 1개의 압축된 *.npz 포맷 파일로 저장하기
   #즉, my-faces-dataset3.npz 파일에는 train,test 데이터에 대한 얼굴 추출 결과 배열과, 각 레이블이 저장돼 있음.
   savez_compressed('sa-faces-train_dataset1.npz', trainX, trainy)

   data = load('sa-faces-train_dataset1.npz')                                                #numpy 배열 불러오기.
   trainX, trainy= data['arr_0'], data['arr_1']         #npz 파일은 index가 arr_0,arr_1,...로 저장돼 있음.

   #print('불러오기: ', trainX.shape, trainy.shape)   
   # facenet 모델 불러오기
   model = load_model("facenet_keras.h5")
   print('모델 불러오기')
   # train 셋에서 각 얼굴을 임베딩으로 변환하기
   newTrainX = list()
   for face_pixels in trainX:
      embedding = get_embedding(model, face_pixels)
      newTrainX.append(embedding)
   newTrainX = asarray(newTrainX)
   print(newTrainX.shape)         #newTrainX.shape = (580,128) facenet 모델은 128개의 요소벡터를 return하기 때문.
   savez_compressed('sa-faces-train-embeddings1.npz', newTrainX, trainy)
   return 'train finish'
    

#출석 체크 시 실행
@app.route('/face_test', methods=['GET'])
def test_model():
   user_id = request.args["id"]
   
   model = load_model("facenet_keras.h5")
   print('모델 불러오기')

   # test 데이터셋 불러오기
   # test 데이터를 압축 파일에서 가져오지 말고, 디렉토리에서 가져오기로 바꾸기.
   train_data = load('sa-faces-train_dataset1.npz')

   #test 파일명 쓰기
   image = Image.open("./data/face_pic/"+user_id+".png");
      # RGB로 변환, 필요시
   image = image.convert('RGB')
      # 이미지를 배열로 변환
   pixels = asarray(image)
      # 감지기 생성, 기본 가중치 이용
   detector = MTCNN()
      # 이미지에서 얼굴 감지
   results = detector.detect_faces(pixels)
      # 첫 번째 얼굴에서 경계 상자 추출 : 각 경계 상자- 왼쪽 아래 모서리 위치(x1,y1) 너비(width) 및 높이(height)를 정의
   print(results)
   try:
      x1, y1, width, height = results[0]['box']
   except:
      return 'error'
      # 버그 수정 : 라이브러리가 음의 픽셀 인덱스를 반환하며,좌표값에 절대값을 취하여 버그를 해결함.
   x1, y1 = abs(x1), abs(y1)
   x2, y2 = x1 + width, y1 + height

      # 얼굴 추출
   face = pixels[y1:y2, x1:x2]
      
      # 모델 사이즈(160*160)로 픽셀 재조정
   image = Image.fromarray(face)            #Image.fromarray()함수를 사용하여 배열(앞에서 pixels = asarray(image)를 통해 image가 배열로 바뀌었음)을 PIL 이미지 객체로 다시 변환
   required_size=(160, 160)
   image = image.resize(required_size)      #160*160 사이즈로 재조정
   test_face_array = asarray(image)                  #image를 다시 배열로 변환



   # 얼굴 임베딩 불러오기
   # test 데이터 임베딩 값(testX)을 압축파일에서 가져오지 말고, 디렉토리에서 가져오도록 바꾸기. (배열로 그대로 저장.)
   train_embedding = load('sa-faces-train-embeddings1.npz')
   trainX, trainy= train_embedding['arr_0'], train_embedding['arr_1']

   test_face_array = test_face_array.astype('int32')
   
      # 채널 간 픽셀값 표준화
   mean, std = test_face_array.mean(), test_face_array.std()
   face_pixels = (test_face_array - mean) / std

      # 얼굴을 하나의 샘플로 변환
      #numpy.expand_dims는 배열의 axis로 지정된 차원을 추가한다.
      #만약 x.shape=(2,) 일 때, axis=0 으로 설정 하면, (첫번째 축,두번째 축,..) 이기 때문에, x.shape=(1,2)가 된다.
   samples = expand_dims(face_pixels, axis=0)
      # 임베딩을 갖기 위한 예측 생성
   test_embedding = model.predict(samples)
      #yhat이 이미지의 embedding 값(vector)이 된다.


   # train,test 데이터 다 구해놓고 여기는ㄱ ㅡ대로 실행하면 될듯

   # 입력 벡터 일반화
   # 벡터 일반화란, 벡터의 길이 또는 크기가 1이나 단위 길이가 될 때까지 값을 스케일링하는 것을 의미한다.
   # Normalizer : : 특성벡터의 모든 길이가 1이 되도록 조정 한다.(반지름 1인 원에 투영하는 느낌)
   # transform은 in_encoder 즉 Normalizer를 실제 데이터에 적용하도록 하는 메서드라고 생각하면 됨.
   in_encoder = Normalizer(norm='l2')
   trainX = in_encoder.transform(trainX)
   testX = in_encoder.transform(test_embedding)

   # Categorical data를 Numerical 로 변환하는 함수 : LabelEncoder()
   # trainy는 train 데이터의  레이블(ex. sohyun,ahyoon,suzy,,,,)등이 저장돼 있는 배열이다.이렇게 Categorical 한 데이터를 수치화하기 위해 사용한다.
   out_encoder = LabelEncoder()
   out_encoder.fit(trainy)

   #실제 데이터에 LabelEncoder 적용
   trainy = out_encoder.transform(trainy)
   #testy = out_encoder.transform(testy)

   # fit a model - svm 이용할 것.
   # scikit-learn의 SVC 클래스를 사용하고 kernel 속성을 linear로 설정해, 선형 SVM을 훈련 데이터에 fit 시킨다.
   # probability = True 란, 예측 후 확률을 얻고 싶을 때 True로 설정한다.
   model = SVC(kernel='linear', probability=True)
   model.fit(trainX, trainy)


   # 모델 테스트 하기
   # 테스트 하기 



   test_face_pixels = test_face_array
   test_face_emb = test_embedding[0]
   #test_face_class = testy[selection]
   #test_face_name = out_encoder.inverse_transform([test_face_class])
   samples = expand_dims(test_face_emb,axis=0)
   yhat_class = model.predict(samples)
   yhat_prob = model.predict_proba(samples)
   class_index = yhat_class[0]  
   class_probability = yhat_prob[0,class_index] * 100
   predict_names = out_encoder.inverse_transform(yhat_class)

   print('예상: %s" (%.3f)' %(predict_names[0], class_probability))
   return predict_names[0]      # 서버에게 이값을 넘겨줄것임
   

@app.route('/yolo', methods=['GET'])
def test_yolo():
    user_id = request.args["id"]
    
    min_confidence = 0.5

    # 0이면 아무것도 검출 안됨, 
    # 1이면 모자만 검출됨, 
    # 2이면 마스크만 검출됨,
    # 3이면 모자와 마스크 모두 검출됨
    result="0"

    # Load Yolo
    # yolo model을 import하기위해서는 3가지 파일이 필요하다.
    # 1 . weights파일 :  이미 학습이 된 모델을 가져와야한다. 이것이 알고리즘 기본이 된다. 이 파일은 yolo사이트에 있다.(5m 46s에 링크있다.)
    # net = cv2.dnn.readNet("yolo/yolov3.weights","yolo/yolov3.cfg")
    net = cv2.dnn.readNet("./model/custom-train-yolo_6000.weights","./model/custom-train-yolo.cfg")
    classes = []

    # coco.names : 분류해 줄 수 있는 물체 80개의 이름을 모두 적어두었다.
    with open("./model/classes.names","r") as f:
        classes = [line.strip() for line in f.readlines()]	# coco.names에 있는 물체의 이름을 classes 리스트에 넣어준다.
    layer_names = net.getLayerNames()   # layer의 이름을 layer_names라는 변수에 넣어준다.
    output_layers = [layer_names[i[0]-1] for i in net.getUnconnectedOutLayers()]
    #colors = np.random.uniform(0,255, size = (len(classes),3))  # 컬러를 지정해준다.색깔을 랜덤으로 지정해준다.

    # Loading image
    #img = cv2.imread("/Users/kim-ahyoon/Z_Class/python/data/face_pic/pic1.jpeg")
    img = cv2.imread("./data/face_pic/"+user_id+".png")
    img = cv2.resize(img, None, fx=0.4, fy=0.4)    # 사이즈를 0.4비율로 줄인다.
    height, width, channels = img.shape
    #cv2.imshow("Orginal Image", img)

    # Detecting objects
    blob = cv2.dnn.blobFromImage(img, 0.00392, (416,416),(0,0,0), True, crop=False)    # cv2.dnn에서 blob타입으로 가져온다. 이때 416X416사이즈로 가져온다. 왜냐하면 스피드와 정확도가 중간단계에 있기 때문이다.

    # setInput과 forward를 사용하여 가져온 데이터를 모델에 load해준다.
    net.setInput(blob)
    outs = net.forward(output_layers)    # outs에는 detect한 물체에 대한 내용들이 다 들어있다.

    # Showing informations on the screen
    class_ids = []    # 클래스의 아이디를 배열에 넣는다.
    confidences = []    # 정확도를 배열에 넣는다.
    boxes = []    # 박스들의 정보들을 배열에 넣는다.

    # for문을 사용하여 outs에 들어있는 물체들을 다 순환해준다.
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)    # scores중에 가장 큰 id를 class_id에 넣게 된다.
            confidence = scores[class_id]
            if confidence > min_confidence:
                # Object detected
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)

                # Rectangle coordinates
                x = int(center_x - w/2)     # x는 사각형의 왼쪽 꼭지점이 된다.
                y = int(center_y - w/2)

                boxes.append([x,y,w,h])     # object box하나하나([x,y,w,h])를 boxes에 넣어준다.
                confidences.append(float(confidence))   # confidence도 cofidences 리스트에 넣어준다.
                class_ids.append(class_id)  # class_id도 class_ids 리스트에 넣어준다.

    # NMSBoxes : 우리가 그림을 그리다보면 노이즈가 생긴다. 예를 들면 얼굴에 박스가 하나만 있어야하는데 여러개의 박스가 생긴다. 이 노이즈 없애준다.
    indexes = cv2.dnn.NMSBoxes(boxes, confidences, min_confidence, 0.4)     # 해당하는 indexes들이 나온다.
    font  = cv2.FONT_HERSHEY_PLAIN

    for i in range(len(boxes)):     # 박스들의 숫자만큼 for문을 돌려서
        if i in indexes:    # 만약 i가 indexes에 있다, 즉 threshold가 넘는 것들, 50퍼센트의 확률이 넘는 것들이 있다면
            x,y,w,h = boxes[i]
            label = str(classes[class_ids[i]])
            #print(i, label)
            if result=="0" and label=="hat":
                result = "1"
            elif result=="0" and label=="with_mask":
                result="2"
            elif result=="1" and label=="with_mask":
                result="3"
            elif result=='2' and label=="hat":
                result="3"
            #cv2.rectangle(img, (x,y), (x+w, y+h), color, 2)
            #cv2.putText(img, label, (x,y+30), font, 2, (0,255,0), 1)

    # cv2.imshow("YOLO Image", img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    print("result : "+result)
    #print(result)
    return result

@app.route('/sleep_test', methods=['GET'])
def testSleep():
   user_id = request.args["id"]
   print("sleep app start")
   sleep_result = "0"  # 0이면 졸고 있지 않은 상태
   cnt=0
   print("number_closed : 0")
   global number_closed
   number_closed = 0
   result = "0"
   for i in range(1,11):
      print("i : "+str(i))
      #image = cv2.imread("./data/sleep_pic/pic"+str(i)+".png")
      #print("./data/sleep_pic/"+str(i)+".png")
      image = cv2.imread("./data/sleep_pic/"+user_id+"/pic"+str(i)+".png")
      print("./data/sleep_pic/"+user_id+"/pic"+str(i)+".png")
      
      
      # frame이 있으면 계속 detect하는 함수를 읽어온다.
      sleep_result = detectAndDisplay(image)    # 이번에 읽어온 frame을 가져다준다.
      if sleep_result=="1":
         print("1. 졸고 있음")
         return sleep_result
      # result=str(i)
      # if result=="30":
      #     return result
   
   return sleep_result

@app.route('/rangeFrame', methods=['GET'])
def rangeFrame_test():
   user_id = request.args["id"]
   print("rangeFrame's user_id : "+user_id)
   print("frame test 시작")
   rangeResult = "0"

   # dlib에서 학습된 모델이다. 다양한 모델이 있다. model폴더 아래에 넣어두면 된다.
   predictor_file = 'model/shape_predictor_68_face_landmarks.dat'
   image_file = './data/sleep_pic/'+user_id+'/pic1.png'


   # get_frontal_face_detector는 dlib이 정면 얼굴을 detect할 detector 객체를 만들었다.
   detector = dlib.get_frontal_face_detector()

   # 앞에서 얘기한 68개의 점을 찍어주는 것을 가져온다.
   predictor = dlib.shape_predictor(predictor_file)

   image = cv2.imread(image_file)

   image_height = image.shape[0]
   image_width = image.shape[1]
   # print("width: "+str(image_width)+" , height : "+str(image_height))

   # 노이즈를 줄여 인식율을 높이기 위해서 GRAY로 바꿔준다.
   # 컬러 사진은 channel이 RGB 3개가 있는데 이걸 단순화해서 하나의 channel(흑백)로 만든다.
   gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

   # 두번째 인자 1이 의미하는 것 : detection할 때 이미지 layer를 1번 적용한다는 것이다.
   # 여러번 적용할 수 있다. 보통 1번만 하면 큰 이미지를 인식하게 된다.
   rects = detector(gray, 1)

   # rects에 인식한 얼굴들이 모두 다 들어가 있다.
   # 그래서 len(rects)는 인식한 얼굴들의 개수이다.
   #print("Number of faces detected: {}".format(len(rects)))


   for (i, rect) in enumerate(rects):
      
      # predictor를 이용하여 얼굴의 part를 찾아서 점들을 가져온다.
      # 그 점들을 배열로 만들어준다.
      points = np.matrix([[p.x, p.y] for p in predictor(gray, rect).parts()])
      
      # 배열로 만들어 놓은 점들 중에서 어떤 걸 가져올지 정해준다. 여기서는 ALL을 해주었다.
      # show_parts는 각 점들의 좌표들이 하나의 2차원 배열로 나온다.
      show_parts = points[ALL]


      cnt = 0
      for (i, point) in enumerate(show_parts):
         x = point[0,0]
         y = point[0,1]
         if (x>0 and x<image_width) and (y>0 and y<image_height):
               cnt=cnt+1
         #else:
               #print(str(i+1)+" : ("+str(x)+" , "+str(y)+")")
         #cv2.circle(image, (x, y), 1, (0, 255, 255), -1) # 노란 점을 찍어준다.
         #cv2.putText(image, "{}".format(i + 1), (x, y - 2),
         #        cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 255, 0), 1)  # 점위에 숫자를 적어주었다.

      if cnt == 68:
         print("1 : no sleep")  # return 값이 1이면 얼굴이 다 잘 나오고 있는 상태이다.
         rangeResult = "1"
      else:
         print("0 : sleep")
         # print("sound")
         #mySound.play()
         #time.sleep(2.0)
         #mySound.stop()
         # if(pygame.mixer.music.get_busy()==False):    # 플레이 되고 있지 않으면
         #     print("sound")
         #     #pygame.mixer.music.play()    # 플레이 해준다.
         #     mySound.play()
         #     time.sleep(2.0)
         #     mySound.stop()
         rangeResult = "0"  # return 값이 0이면 얼굴이 나오지 않고 있는 상태이다.
   
   return rangeResult

if __name__=="__main__":
     app.run(port=5000,debug=True)