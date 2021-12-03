
#얼굴 추출 파일과 얼굴 임베딩 계산 값 파일 만들어주는 코드(회원가입시 사용)



#model = load_model("C:/Users/LG/last/Z_Class/python/model/facenet_keras.h5")
#print(model.inputs)
#print(model.outputs)

# In[2]:

# train,test 데이터 셋 준비 - extract_face,labeling
from tensorflow.keras.models import load_model
import os
from os import listdir
from os.path import isdir
from PIL import Image
from matplotlib import pyplot
from numpy import savez_compressed
from numpy import asarray
from mtcnn.mtcnn import MTCNN
from numpy import load
from numpy import expand_dims
from keras.models import load_model

# 주어진 사진에서 하나의 얼굴 추출
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
	image = Image.fromarray(face)				#Image.fromarray()함수를 사용하여 배열(앞에서 pixels = asarray(image)를 통해 image가 배열로 바뀌었음)을 PIL 이미지 객체로 다시 변환
	image = image.resize(required_size)		#160*160 사이즈로 재조정
	face_array = asarray(image)						#image를 다시 배열로 변환
	return face_array

# 디렉토리 안의 모든 이미지를 불러오고 이미지에서 얼굴 추출(extract_face 사용)
def load_faces(directory):
	faces = list()												#list로 선언

	# 파일 열거
	for filename in listdir(directory):		#os.listdir() : 지정한 디렉토리내의 모든 파일과 디렉토리 리스트를 리턴한다.
		# 경로
		path = directory + filename					#path가 각각의 하위디렉토리(ex. sohyun,ahyoon,suzy...)로 설정되고,위치한 filename이 for문 돌면서 설정됨.
		# 얼굴 추출
		face = extract_face(path)						#모든 이미지에 대해 extract_face가 수행되고, 
		# 저장
		faces.append(face)									#extract_face의 return 값은 face_array 즉, 배열임.그것을 faces 리스트에 저장함.
	return faces													

# 이미지를 포함하는 각 클래스에 대해 하나의 하위 디렉토리가 포함된 데이터셋을 불러오기 - train dataset에만 쓰면됨.
def load_dataset(directory):
	X, y = list(), list()
	# 클래스별로 폴더 열거
	for subdir in listdir(directory):			#directory로 받는게 '../train', '../val' 이기 때문에 그것의 subdir(sohyun,ahyoon,suzy,,,)를 for문으로 돌리기
		# 경로
		path = directory + subdir + '/'
		# 디렉토리에 있을 수 있는 파일을 건너뛰기(디렉토리가 아닌 파일)
		if not isdir(path):
			continue


		# 하위 디렉토리의 모든 얼굴 불러오기
		faces = load_faces(path)
		# 레이블 생성
		labels = [subdir for _ in range(len(faces))]			#하위 디렉토리(ex '.../sohyun')에 있는 이미지 file 수만큼 for문 돌려서 labels 리스트 만듦 ex) ['sohyun','sohyun',...]
		# 진행 상황 요약
		print('>%d개의 데이터를 불러왔습니다. 클래스명: %s' % (len(faces), subdir))
		# 저장
		#list.extend(iterable)는 리스트 끝에 가장 바깥쪽 iterable의 모든 항목을 넣습니다.즉,넣어질 때 리스트의 []꺽쇠가 빼고 넣어진다고 보면 됨.-중첩리스트 방지
		X.extend(faces)
		y.extend(labels)
	return asarray(X), asarray(y)			#리스트를 배열로 바꿈.
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

def train_data():

	# 훈련 데이터셋 불러오기
	train_path = 'C:/Users/LG/last/Z_Class/python/image/train/'
	trainX, trainy = load_dataset(train_path)			#load dataset을 통해서 tranX에는 모든 train 사진에 대한 extract_face의 return 값이 배열로 저장돼 있고, 
																								#trainy에는 모든 train 사진에 대한 각각의 label 값들(directory 이름들)이 저장돼 있음
	#print(trainX.shape, trainy.shape)							#trainX.shape : (580,160,160,3) - 580은 전체 train data의 총 갯수고, 160,160은 사이즈, 3은 RGB임을 나타냄.
																								#trainy.shape : (580,) - 모든 사진 580개에 대한 label이 저장돼 있음.
	# 테스트 데이터셋 불러오기
	#test_path = 'C:/Users/LG/newnew/Z_Class/python/face_recognition/image/test/'
	#testX, testy = load_dataset(test_path)

	#print(testX.shape, testy.shape)

	# savez_compressed : 여러개의 배열을 1개의 압축된 *.npz 포맷 파일로 저장하기
	#즉, my-faces-dataset3.npz 파일에는 train,test 데이터에 대한 얼굴 추출 결과 배열과, 각 레이블이 저장돼 있음.
	savez_compressed('sa-faces-train_dataset.npz', trainX, trainy)

	data = load('sa-faces-train_dataset.npz')																#numpy 배열 불러오기.
	trainX, trainy= data['arr_0'], data['arr_1']			#npz 파일은 index가 arr_0,arr_1,...로 저장돼 있음.

	#print('불러오기: ', trainX.shape, trainy.shape)	
	# facenet 모델 불러오기
	model = load_model("C:/Users/LG/last/Z_Class/python/facenet_keras.h5")
	#print('모델 불러오기')
	# train 셋에서 각 얼굴을 임베딩으로 변환하기
	newTrainX = list()
	for face_pixels in trainX:
		embedding = get_embedding(model, face_pixels)
		newTrainX.append(embedding)
	newTrainX = asarray(newTrainX)
	#print(newTrainX.shape)			#newTrainX.shape = (580,128) facenet 모델은 128개의 요소벡터를 return하기 때문.
	savez_compressed('sa-faces-train-embeddings.npz', newTrainX, trainy)

if __name__ == "__main__":
    train_data()

# In[ ]:


# facenet을 이용해 데이터셋 내 각 얼굴에 대한 얼굴 임베딩 계산



# 하나의 얼굴의 얼굴 임베딩 얻기
# 임베딩을 예측하려면,Facenet 모델의 기대치에 맞게 이미지의 적당한 픽셀 값이 준비되어야 한다.
# Facenet 모델의 기대치? 표준화된 pixel 값을 말함.
#표준화 또한 데이터 전처리의 일부임.어떤 모델은 정규화 할 때 더 성능이 좋기도 하고, 표준화해서 더 좋은 모델도 있다. facenet은 후자인 것.



# 얼굴 데이터셋 불러오기
#my-face-dataset : 위에서 저장한 trainX,trainy,testX,testy 의numpy 배열이 저장되어 있음.

