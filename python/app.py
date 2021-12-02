from flask import Flask
import numpy as np
import cv2

app = Flask(__name__)

# localhost:5000/flask로 접속 시 Flask server 출력됨
# node js 서버에서 127.0.0.1:5000/flask로 접속
# python -m flask run 으로 터미널에서 실행 가능

@app.route('/flask', methods=['GET'])
def test():
    return "hi"

# @app.route('/yolo', methods=['POST'])
# def test3():
#     return "hi"

@app.route('/yolo', methods=['POST'])
def test_yolo():
    #print("flask hi")
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
    net = cv2.dnn.readNet("/Users/kim-ahyoon/Z_Class/python/model/custom-train-yolo_6000.weights","/Users/kim-ahyoon/Z_Class/python/model/custom-train-yolo.cfg")
    classes = []

    # coco.names : 분류해 줄 수 있는 물체 80개의 이름을 모두 적어두었다.
    with open("/Users/kim-ahyoon/Z_Class/python/model/classes.names","r") as f:
        classes = [line.strip() for line in f.readlines()]	# coco.names에 있는 물체의 이름을 classes 리스트에 넣어준다.
    layer_names = net.getLayerNames()   # layer의 이름을 layer_names라는 변수에 넣어준다.
    output_layers = [layer_names[i[0]-1] for i in net.getUnconnectedOutLayers()]
    colors = np.random.uniform(0,255, size = (len(classes),3))  # 컬러를 지정해준다.색깔을 랜덤으로 지정해준다.

    # Loading image
    #img = cv2.imread("/Users/kim-ahyoon/Z_Class/python/data/face_pic/pic1.jpeg")
    img = cv2.imread("/Users/kim-ahyoon/Z_Class/python/data/face_pic/pic1.png")
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
            print(i,label)
            if result=="0" and label=="hat":
                result = "1"
            elif result=="0" and label=="with_mask":
                result="2"
            elif result=="1" and label=="with_mask":
                result="3"
            elif result=='2' and label=="hat":
                result="3"
            color = colors[i]   # 컬러는 랜덤값이 들어있다.
            #cv2.rectangle(img, (x,y), (x+w, y+h), color, 2)
            #cv2.putText(img, label, (x,y+30), font, 2, (0,255,0), 1)

    # cv2.imshow("YOLO Image", img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    #print("result : "+result)
    return result

if __name__=="__main__":
    app.run(port=5000,debug=True)


