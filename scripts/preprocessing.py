# import sys, time

# def square_of_number():
#     # time.sleep(3) # Simulate a long running process :), you can comment this line to have RT
#     print(int(sys.argv[1]) ** 2)

# if __name__ == "__main__":
#     square_of_number()

# pyinstaller preprocessing.py -F --collect-submodules=pydicom

import os
import shutil
import sys
import pydicom
import numpy as np
from PIL import Image, ImageEnhance

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

def process_input_folder(input_folder, output_folder):
    preprocessing_folder = os.path.join(output_folder, f"{os.path.basename(input_folder)}_preprocessing")
    
    # Create preprocessing folder
    os.makedirs(preprocessing_folder, exist_ok=True)
    
    jpg_count = 0
    
    # Browse all levels of subfolders in input folder
    for root, dirs, files in os.walk(input_folder):
        for file in files:
            file_path = os.path.join(root, file)
            if file.endswith(".jpg"):
                shutil.copy(file_path, preprocessing_folder)  # Copy JPG files to preprocessing folder
                jpg_count += 1
            elif file.endswith(".dcm"):
                convert_dicom_to_jpeg(file_path, preprocessing_folder)  # Convert DICOM to JPEG
    
                jpg_count += 1

    
    # Output jpg count and preprocessing folder path
    print(f"Total JPG files in preprocessing folder: {jpg_count}")
    print(f"Preprocessing folder path: {preprocessing_folder}")


# 定义输入文件夹
input_folder_path = str(sys.argv[1])
output_folder_path = os.path.join(os.path.dirname(input_folder_path), os.path.basename(input_folder_path)+ '_output')

process_input_folder(input_folder_path, output_folder_path)

