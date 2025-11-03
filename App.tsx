import React, { useState, useEffect } from 'react';
import { StatusBar, View } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as WebBrowser from 'expo-web-browser';
import CalculatorVault from './components/CalculatorVault';
import ChatApp from './components/ChatApp';
import AppNavigator from './components/AppNavigator';
import DraggablePanicButton from './components/DraggablePanicButton';
import GlobalBackdrop from './src/components/GlobalBackdrop';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import VagueNotification from './src/components/VagueNotification';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");
  const [isPanicEngaged, setIsPanicEngaged] = useState(false);

  const SECRET_CODE_1 = "280310";
  const SECRET_CODE_2 = "210610";

  // Educational URLs for diversion (randomly selected)
  const educationalUrls = [
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/yOn71/radioactivity',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/yRD1P/calorimetry',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/y6xVD/electro-magnetism',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1y4PN/household-circuits',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1Oklp/current-electricity',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/10WgB/sound',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/17v2G/spectrum',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/126VQ/refraction-lens',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1lLM1/refraction-plane-surfaces',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/17ArN/machines',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/1W1zk/work-energy-power',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-physics-selina/solutions/15LMB/force',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2bldl/pollution',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2g209/population',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2lAPe/human-evolution',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/26l1g/reproductive-system',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2JLzX/endocrine-system',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/27m2b/sense-organs',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/b1Qv0/nervous-system',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/273Yz/excretory-system',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/25RKz/circulatory-system',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2xKxb/chemical-coordination-plants',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2ADRN/photosynthesis',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2xyVz/transpiration',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/2qmL9/absorption-roots',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/27ozd/genetics',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/EyJKX/chromosomes-cell-cycle-cell-division',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-biology-selina/solutions/QyXNN/cell-life-unit',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/w8dDLa/practical-work',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wk96dG/organic-chemistry',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wx33kG/sulphuric-acid-study',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wxb9BZ/nitric-acid-study',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/rGNzdj/ammonia-study',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/waNXJG/hydrogen-chloride-study',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wa8brK/metallurgy',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wop3d4/electrolysis',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/Q7YknK/mole-concept-miscellaneous',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/rB9b6V/mole-concept-stoichiometry',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/wo6dxO/analytical-chemistry',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/Q7W4Rw/acids-bases-salts',
    'https://www.knowledgeboat.com/learn/class-10-icse-concise-chemistry-selina/solutions/rBD7Ka/chemical-bonding'
  ];

  // Enhanced Panic Handler: Instant calculator activation
  const handlePanic = async () => {
    console.log("🔥 PANIC BUTTON ACTIVATED - IMMEDIATE CALCULATOR ACTIVATION");
    
    // Step 1: Log activation
    console.log("PANIC BUTTON ACTIVATED");
    
    // Step 2: INSTANTLY lock app and show calculator
    setIsUnlocked(false);
    setIsPanicEngaged(false); // Allow calculator to show normally
    
    // Step 3: Diversion URL handled by button component
    console.log("✅ Calculator activated immediately - diversion handled by button");
  };

  // Enhanced panic engaged handler: Show calculator immediately
  const handlePanicEngaged = () => {
    console.log("📱 IMMEDIATELY SHOWING CALCULATOR SCREEN");
    setIsPanicEngaged(true);
    setIsUnlocked(false);
    setDisplayValue("0");
  };

  const handleSignOut = () => {
    console.log("USER SIGNED OUT");
    setIsUnlocked(false);
    setDisplayValue("0");
    setIsPanicEngaged(false);
  };

  // Log current state for debugging
  useEffect(() => {
    console.log(`📊 App State - Unlocked: ${isUnlocked}, Panic Engaged: ${isPanicEngaged}, Display: ${displayValue}`);
  }, [isUnlocked, isPanicEngaged, displayValue]);

  const [fontsLoaded] = useFonts({
    'Inter': require('@expo-google-fonts/inter'),
  });

  const AppContent = () => {
    const { isDark, getThemeColors } = useTheme();
    const [notificationVisible, setNotificationVisible] = useState(false);

    // Show random notification every 30-60 seconds
    useEffect(() => {
      const showNotification = () => {
        setNotificationVisible(true);
        setTimeout(() => setNotificationVisible(false), 3000);
      };

      const interval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every interval
          showNotification();
        }
      }, 45000); // Every 45 seconds

      return () => clearInterval(interval);
    }, []);

    return (
      <GlobalBackdrop>
        <View style={{ flex: 1 }}>
          {isUnlocked ? (
            <ChatApp onPanic={handlePanic} />
          ) : (
            <CalculatorVault 
              displayValue={displayValue}
              setDisplayValue={setDisplayValue}
              setIsUnlocked={setIsUnlocked}
              secretCodes={{ SECRET_CODE_1, SECRET_CODE_2 }}
              isPanicMode={isPanicEngaged}
            />
          )}
          <DraggablePanicButton 
            onPanic={handlePanic} 
            isPanicEngaged={isPanicEngaged}
            onPanicEngaged={handlePanicEngaged}
          />
          <VagueNotification 
            visible={notificationVisible}
            type="info"
            duration={3000}
            onDismiss={() => setNotificationVisible(false)}
          />
          <StatusBar style={isDark ? "light" : "dark"} />
        </View>
      </GlobalBackdrop>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}