package com.gymmanagement.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Keep system status bar (time/signal) outside the WebView content
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
