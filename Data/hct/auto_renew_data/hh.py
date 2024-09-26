import time

print("Starting script...")

for i in range(100):
    time.sleep(0.1)  # 模拟任务
    print(f"Progress: {i+1}%")  # 输出进度信息

print("Script finished.")