//HELLOFILE
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ReadHelloFile {
    public static void main(String[] args) {
        String fileName = "Hello.txt"; // Tên file văn bản cần đọc

        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line); // In từng dòng ra màn hình
            }
        } catch (IOException e) {
            System.out.println("Có lỗi xảy ra khi đọc file: " + e.getMessage());
        }
    }
}