import React, { useState } from 'react';

// Mock the calculator logic for testing (extracted from CalculatorVault component)
const CalculatorVaultLogic = () => {
  const [displayValue, setDisplayValue] = useState("0");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const SECRET_CODE_1 = "280310";
  const SECRET_CODE_2 = "210610";

  const handlePress = (value: string) => {
    if (value === 'C') {
      setDisplayValue('0');
    } else if (value === '=') {
      if (displayValue === SECRET_CODE_1 || displayValue === SECRET_CODE_2) {
        setIsUnlocked(true);
      } else {
        setDisplayValue('0');
      }
    } else {
      // Number pressed
      if (displayValue === '0') {
        setDisplayValue(value);
      } else {
        setDisplayValue(displayValue + value);
      }
    }
  };

  return {
    displayValue,
    isUnlocked,
    handlePress
  };
};

// Test helpers
const simulateButtonPresses = (calculator: any, buttons: string[]) => {
  buttons.forEach(button => {
    calculator.handlePress(button);
  });
};

describe('CalculatorVault Logic Tests', () => {
  let calculator: any;

  beforeEach(() => {
    calculator = CalculatorVaultLogic();
  });

  describe('Happy Path Tests', () => {
    it('unlocks with secret code 1 (280310)', () => {
      simulateButtonPresses(calculator, ['2', '8', '0', '3', '1', '0', '=']);
      expect(calculator.isUnlocked).toBe(true);
      expect(calculator.displayValue).toBe("280310");
    });

    it('unlocks with secret code 2 (210610)', () => {
      simulateButtonPresses(calculator, ['2', '1', '0', '6', '1', '0', '=']);
      expect(calculator.isUnlocked).toBe(true);
      expect(calculator.displayValue).toBe("210610");
    });
  });

  describe('Fail Path Tests', () => {
    it('stays locked with wrong code', () => {
      simulateButtonPresses(calculator, ['1', '2', '3', '4', '=']);
      expect(calculator.isUnlocked).toBe(false);
      expect(calculator.displayValue).toBe("0"); // Should reset to 0 on wrong code
    });

    it('clears the display with C button', () => {
      simulateButtonPresses(calculator, ['1', '2', '3']);
      expect(calculator.displayValue).toBe("123");
      
      calculator.handlePress('C');
      expect(calculator.displayValue).toBe("0");
    });
  });

  describe('Edge Cases', () => {
    it('replaces leading zero when pressing first number', () => {
      expect(calculator.displayValue).toBe("0");
      calculator.handlePress('5');
      expect(calculator.displayValue).toBe("5");
    });

    it('appends numbers after first input', () => {
      calculator.handlePress('5');
      calculator.handlePress('6');
      expect(calculator.displayValue).toBe("56");
    });

    it('clears display to 0 on wrong code without unlocking', () => {
      // Try a wrong code
      simulateButtonPresses(calculator, ['9', '9', '9', '=']);
      expect(calculator.isUnlocked).toBe(false);
      expect(calculator.displayValue).toBe("0");
    });
  });
});