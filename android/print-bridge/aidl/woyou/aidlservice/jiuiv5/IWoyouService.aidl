package woyou.aidlservice.jiuiv5;

import woyou.aidlservice.jiuiv5.ICallback;

/*
 * The first eleven methods of SUNMI's printer service, in the service's own order.
 * Binder transaction codes come from the position, so nothing may be inserted or reordered.
 */
interface IWoyouService {
    boolean postPrintData(String packageName, in byte[] data, int offset, int length);
    int getFirmwareStatus();
    String getServiceVersion();
    void printerInit(in ICallback callback);
    void printerSelfChecking(in ICallback callback);
    String getPrinterSerialNo();
    String getPrinterVersion();
    String getPrinterModal();
    int getPrintedLength();
    void lineWrap(int n, in ICallback callback);
    void sendRAWData(in byte[] data, in ICallback callback);
}
