package com.tahawwaa.invoice;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new PrintHelper(), "AndroidPrint");
    }

    private class PrintHelper {
        @JavascriptInterface
        public void print() {
            runOnUiThread(() -> {
                WebView webView = getBridge().getWebView();
                PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                String jobName = "فاکتور فروش";
                printManager.print(jobName, webView.createPrintDocumentAdapter(jobName), null);
            });
        }
    }
}
