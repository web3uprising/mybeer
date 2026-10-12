package dot.mybeer.print;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Base64;
import android.widget.Toast;
import woyou.aidlservice.jiuiv5.IWoyouService;

public class PrintActivity extends Activity {
  private static final String PRINTER_PACKAGE = "woyou.aidlservice.jiuiv5";
  private static final String PRINTER_ACTION = "woyou.aidlservice.jiuiv5.IWoyouService";

  private ServiceConnection connection;

  @Override
  protected void onCreate(Bundle state) {
    super.onCreate(state);
    byte[] receipt = receiptBytes(getIntent().getData());
    if (receipt == null) {
      done("Recibo vazio");
      return;
    }
    connection = new ServiceConnection() {
      @Override
      public void onServiceConnected(ComponentName name, IBinder binder) {
        try {
          IWoyouService printer = IWoyouService.Stub.asInterface(binder);
          printer.printerInit(null);
          printer.sendRAWData(receipt, null);
          printer.lineWrap(3, null);
          done("Recibo impresso");
        } catch (Exception error) {
          done("Impressora: " + error.getMessage());
        }
      }

      @Override
      public void onServiceDisconnected(ComponentName name) {}
    };
    Intent service = new Intent(PRINTER_ACTION);
    service.setPackage(PRINTER_PACKAGE);
    if (!bindService(service, connection, Context.BIND_AUTO_CREATE)) {
      connection = null;
      done("Sem serviço de impressão SUNMI");
    }
  }

  private static byte[] receiptBytes(Uri data) {
    if (data == null) return null;
    String payload = data.getSchemeSpecificPart();
    if (!payload.startsWith("base64,")) return null;
    try {
      return Base64.decode(payload.substring("base64,".length()), Base64.DEFAULT);
    } catch (IllegalArgumentException error) {
      return null;
    }
  }

  private void done(String message) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    finish();
  }

  @Override
  protected void onDestroy() {
    if (connection != null) unbindService(connection);
    super.onDestroy();
  }
}
