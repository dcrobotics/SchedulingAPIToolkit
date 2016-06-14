import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.*;

/**
 * Created by chuckdries on 6/14/16.
 */
public class InfoLayer {
    public static void main(String[] args){

        String pagesURL = "https://desertcommunityrobotics.com/wp-json/wp/v2/pages";
//        String localtesturl = "";

//        System.out.println(java.home);
        System.out.println(get(pagesURL));
    }
    public static String get(String targetURL){
        HttpURLConnection connection = null;
        try{
            //create request
            URL url = new URL(targetURL);
            connection = (HttpURLConnection)url.openConnection();
            connection.setRequestMethod("GET");

            //send request body
            //anything here? Probably not for GET requests

            //get response
            InputStream is = connection.getInputStream();
            BufferedReader br = new BufferedReader(new InputStreamReader(is));
            StringBuilder response = new StringBuilder();
            String line;
            while((line = br.readLine()) != null){
                response.append(line);
                response.append('\n');
            }
            br.close();
            return response.toString();
            /* Notes
            - Why use StringBuilder vs just +'ing an empty string?
             */

        } catch(Exception e) {
            e.printStackTrace();
            return null;
        }finally{
            if(connection!=null){
                connection.disconnect();
            }
        }
    }
    //Found on the internet, let's break this down
    public static String excutePost(String targetURL, String urlParameters) {
        HttpURLConnection connection = null;
        try {
            //Create connection
            URL url = new URL(targetURL);
            connection = (HttpURLConnection)url.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type",
                    "application/x-www-form-urlencoded");

            connection.setRequestProperty("Content-Length",
                    Integer.toString(urlParameters.getBytes().length));
            connection.setRequestProperty("Content-Language", "en-US");

            connection.setUseCaches(false);
            connection.setDoOutput(true);

            //Send request
            DataOutputStream wr = new DataOutputStream (
                    connection.getOutputStream());
            wr.writeBytes(urlParameters);
            wr.close();

            //Get Response
            InputStream is = connection.getInputStream();
            BufferedReader rd = new BufferedReader(new InputStreamReader(is));
            StringBuilder response = new StringBuilder(); // or StringBuffer if not Java 5+
            String line;
            while((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');
            }
            rd.close();
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if(connection != null) {
                connection.disconnect();
            }
        }
    }
}
