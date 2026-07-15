package com.gymmanagement.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    /** How long the branded splash (icon) stays on screen. */
    private static final long SPLASH_MS = 1800L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        final SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        final long startedAt = System.currentTimeMillis();
        splashScreen.setKeepOnScreenCondition(
            () -> (System.currentTimeMillis() - startedAt) < SPLASH_MS
        );

        super.onCreate(savedInstanceState);

        // Cap edge-to-edge: keep time/signal bar OUTSIDE WebView content
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(Color.parseColor("#161B22"));
        getWindow().setNavigationBarColor(Color.parseColor("#161B22"));

        WindowInsetsControllerCompat bars =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (bars != null) {
            bars.setAppearanceLightStatusBars(false);
            bars.setAppearanceLightNavigationBars(false);
        }

        View root = findViewById(android.R.id.content);
        if (root != null) {
            applyInsetPadding(root);
            root.post(() -> applyInsetPaddingRecursive(root));
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // Capacitor/WebView can re-enable edge-to-edge after load — re-assert.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        View root = findViewById(android.R.id.content);
        if (root != null) {
            applyInsetPadding(root);
        }
    }

    private void applyInsetPadding(View view) {
        ViewCompat.setOnApplyWindowInsetsListener(view, (v, windowInsets) -> {
            Insets bars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(view);
    }

    private void applyInsetPaddingRecursive(View view) {
        applyInsetPadding(view);
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                applyInsetPaddingRecursive(group.getChildAt(i));
            }
        }
    }
}
