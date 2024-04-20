# import sys, time

# def square_of_number():
#     # time.sleep(3) # Simulate a long running process :), you can comment this line to have RT
#     print(int(sys.argv[1]) ** 2)

# if __name__ == "__main__":
#     square_of_number()

import sys
import pydicom
from PIL import Image, ImageEnhance
import numpy as np
import os
import shutil

def get_dicom_image_size(dicom_file_path):
    dicom_file = pydicom.dcmread(dicom_file_path)
    return dicom_file.pixel_array.shape[::-1]  # (height, width)

def convert_dicom_to_jpeg(dicom_file_path, output_folder, quality=95):
    # 读取DICOM文件
    dicom_file = pydicom.dcmread(dicom_file_path)
 
    # 将DICOM数据转换为numpy数组
    image_array = dicom_file.pixel_array
    
    # 直方图均衡化
    image_array = (image_array - np.min(image_array)) / (np.max(image_array) - np.min(image_array)) * 255
    image_array = image_array.astype(np.uint8)
    image = Image.fromarray(image_array)
    enhancer = ImageEnhance.Contrast(image)
    image_enhanced = enhancer.enhance(1.0)  # 调整对比度，可以根据需要调整参数
    
    # 获取DICOM图像的尺寸
    image_size = get_dicom_image_size(dicom_file_path)
    
    # Resize image to original DICOM size
    image_enhanced = image_enhanced.resize(image_size, Image.LANCZOS)
    
    # 构建输出文件名
    base_name = os.path.basename(dicom_file_path)
    output_file_name = os.path.splitext(base_name)[0] + '.jpg'
    output_path = os.path.join(output_folder, output_file_name)
 
    # 保存为JPEG with specified quality
    image_enhanced.save(output_path, quality=quality)

def preprocess_data(input_folder):
    # 构建预处理目标文件夹路径
    preprocessing_folder = os.path.join(os.path.dirname(input_folder), 'Preprocessing_' + os.path.basename(input_folder))
    
    # 创建预处理目标文件夹
    if not os.path.exists(preprocessing_folder):
        os.makedirs(preprocessing_folder)
    
    # 计数器：记录已处理的文件数
    jpg_count = 0
    dicom_count = 0
    
    # 遍历输入文件夹中的所有文件
    for file_name in os.listdir(input_folder):
        file_path = os.path.join(input_folder, file_name)
        # 处理DICOM文件
        if file_name.lower().endswith('.dcm'):
            convert_dicom_to_jpeg(file_path, preprocessing_folder)
            dicom_count += 1
        # 复制JPEG文件到预处理目标文件夹
        elif file_name.lower().endswith('.jpg'):
            shutil.copy(file_path, preprocessing_folder)
            jpg_count += 1
    
    # 计算预处理后文件夹中的文件数量
    preprocessing_jpg_count = sum(1 for file in os.listdir(preprocessing_folder) if file.lower().endswith('.jpg'))
    preprocessing_dicom_count = sum(1 for file in os.listdir(preprocessing_folder) if file.lower().endswith('.dcm'))
    
    # 计算输入文件夹中的文件数量
    input_jpg_count = sum(1 for file in os.listdir(input_folder) if file.lower().endswith('.jpg'))
    input_dicom_count = sum(1 for file in os.listdir(input_folder) if file.lower().endswith('.dcm'))
    
    return (preprocessing_jpg_count, preprocessing_dicom_count), (input_jpg_count, input_dicom_count)

# 定义输入文件夹
input_folder = str(sys.argv[1])

# 进行数据预处理
preprocessed_counts, input_counts = preprocess_data(input_folder)

# # 输出处理后和输入文件夹中的文件数量
# print("Preprocessing folder JPEG count:", preprocessed_counts[0])
# print("Preprocessing folder DICOM count:", preprocessed_counts[1])
# print("Input folder JPEG count:", input_counts[0])
# print("Input folder DICOM count:", input_counts[1])

# 比较文件数量是否相等
if preprocessed_counts[0]  == input_counts[0] +input_counts[1]:
    print("File counts are equal.")
else:
    print("File counts are not equal.")
