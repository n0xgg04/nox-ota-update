# CODE PTIT SUBMIT
(by n0xgg04)

> ## Này để làm gì?
> À, khi làm code ptit, có phải bạn phải save file, sau đó qua trang code ptit nộp và chờ kết quả có phải không?
>Nếu bạn thấy điều này bình thường, không quá nhọc thì tool này không dành cho bạn... Tool này giúp bạn submit code lên codeptit chỉ cần code bạn có dòng đầu tiên chứa mã bài và tên code có chứa ``main``. Ví dụ ``main.py``, ``main.java``

#### Ví dụ:
``main.py``

```py
#PY10123

...code 
```

Để nộp code, bạn chỉ cần
```bash
npx cptit-submit
```

Lần đầu sử dụng, tool sẽ yêu cầu bạn cung cấp thông tin đăng nhập. Đăng nhập vào thôi!

Nếu trong kỳ học, bạn có hơn 1 môn code, bạn sẽ cần chọn khoá (course) để tool biết sẽ nộp vào môn học nào. Sử dụng mũi tên lên xuống trên bàn phím để lựa chọn, ấn ``Enter`` để xác nhận.

Kiểu:
```
? Select target course:
  Default: Học kỳ 1 năm học 2024 - 2025
❯ Lập trình hướng đối tượng - Nhóm 12
  Lập trình với Python - Nhóm 08
  Thuật toán và ứng dụng nâng cao - Nhóm THUẬT TOÁN NÂNG CAO - 2024
```

Oke và chờ kết quả thôi... Ví dụ:
```
Login to B22DCCN021...!
COURSE: Lập trình với Python - Nhóm 08
⠙ Submiting PY01005...
⠇ Submiting PY01005...
Submited PY01005
┌──────────┬────────────────────┬───────────────┬──────────┬──────────┬──────────┬──────────┬───────────────┐
│ Problem  │ Problem Name       │ Date          │ Time     │ Result   │ Memory   │ Run Time │ Compiler      │
├──────────┼────────────────────┼───────────────┼──────────┼──────────┼──────────┼──────────┼───────────────┤
│ PY01005  │ SỐ MAY MẮN         │ 2024-09-02    │ 23:42:58 │ IR       │ 9388Kb   │ 0.03s    │ Python 3      │
└──────────┴────────────────────┴───────────────┴──────────┴──────────┴──────────┴──────────┴───────────────┘
```

Từ lần 2, nếu muốn submit bài đó tiếp, chỉ cần ấn mũi tên lên ở terminal và ấn Enter, tool sẽ khi nhớ môn học, và chỉ hỏi lại khi bạn ``reset`` để đổi môn.

### Chọn lại course:
Chạy lệnh:
```bash
npx cptit-submit -c
```

### Đăng nhập tài khoản khác :
Chạy lệnh:
```bash
npx cptit-submit -r
```

Code hơi bẩn do tớ bận vler, rảnh rảnh code cho vui thôi nên đừng soi làm gì:))