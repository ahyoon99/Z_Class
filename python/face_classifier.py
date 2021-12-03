#!/usr/bin/env python
# coding: utf-8

# In[1]:




# In[1]:


from random import choice
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

def test_model():

	model = load_model("C:/Users/LG/last/Z_Class/python/facenet_keras.h5")
	print('모델 불러오기')

	# test 데이터셋 불러오기
	# test 데이터를 압축 파일에서 가져오지 말고, 디렉토리에서 가져오기로 바꾸기.
	train_data = load('sa-faces-train_dataset.npz')

	#test 파일명 쓰기
	image = Image.open("C:/Users/LG/newnew/Z_Class/python/face_recognition/image/test/daehyun.jpg")
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
	required_size=(160, 160)
	image = image.resize(required_size)		#160*160 사이즈로 재조정
	test_face_array = asarray(image)						#image를 다시 배열로 변환



	# 얼굴 임베딩 불러오기
	# test 데이터 임베딩 값(testX)을 압축파일에서 가져오지 말고, 디렉토리에서 가져오도록 바꾸기. (배열로 그대로 저장.)
	train_embedding = load('sa-faces-train-embeddings2.npz')
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



	# 이거 그냥 for문 안돌리고  하나만 넣은다음에 pixel 뽑아내고 embeding 뽑아내면 될ㄷ슷
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
	return predict_names[0]		# 서버에게 이값을 넘겨줄것임
	# pyplot.imshow(test_face_pixels)
	# title = '%s (%.3f)' % (predict_names[0], class_probability)
	# pyplot.title(title)
	# pyplot.show()

if __name__ == "__main__":
    test_model()
# In[ ]:




