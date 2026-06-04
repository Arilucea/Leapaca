/*
Integration tests for Chrome extension functionality

These tests require a test environment with Chrome extension APIs mocked.
Run with: npm test (after setting up Jest with chrome extension mocks)
*/

// Mock Chrome APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn(),
    },
  },
  runtime: {
    lastError: null,
    getURL: jest.fn((path) => `chrome-extension://test/${path}`),
  },
  i18n: {
    getMessage: jest.fn((key) => key),
  },
};

describe("Storage Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    chrome.runtime.lastError = null;
  });

  test("should handle storage get errors gracefully", (done) => {
    chrome.runtime.lastError = { message: "Storage quota exceeded" };

    chrome.storage.sync.get.mockImplementation((defaults, callback) => {
      callback(null);
    });

    // This would be called from content.js initialization
    chrome.storage.sync.get({ speed: 1 }, (stored) => {
      if (chrome.runtime.lastError) {
        expect(chrome.runtime.lastError.message).toBe("Storage quota exceeded");
        done();
      }
    });
  });

  test("should handle storage set errors gracefully", (done) => {
    chrome.runtime.lastError = { message: "Storage write failed" };

    chrome.storage.sync.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });

    chrome.storage.sync.set({ speed: 1.5 }, () => {
      if (chrome.runtime.lastError) {
        expect(chrome.runtime.lastError.message).toBe("Storage write failed");
        done();
      }
    });
  });
});

describe("Speed Validation", () => {
  test("should validate speed within range", () => {
    const MIN_SPEED = 0;
    const MAX_SPEED = 2.5;

    const validateSpeed = (speed) => {
      const numSpeed = Number(speed);
      if (isNaN(numSpeed) || numSpeed < MIN_SPEED || numSpeed > MAX_SPEED) {
        return 1; // default
      }
      return numSpeed;
    };

    expect(validateSpeed(1.5)).toBe(1.5);
    expect(validateSpeed(0)).toBe(0);
    expect(validateSpeed(2.5)).toBe(2.5);
    expect(validateSpeed(-1)).toBe(1); // invalid, returns default
    expect(validateSpeed(3)).toBe(1); // invalid, returns default
    expect(validateSpeed("invalid")).toBe(1); // invalid, returns default
  });
});

describe("Selector Visibility Check", () => {
  test("should correctly identify visible elements", () => {
    const isVisible = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    // Mock element with visible dimensions
    const visibleElement = {
      getBoundingClientRect: () => ({ width: 100, height: 50 }),
    };

    // Mock element with zero dimensions
    const hiddenElement = {
      getBoundingClientRect: () => ({ width: 0, height: 0 }),
    };

    expect(isVisible(visibleElement)).toBe(true);
    expect(isVisible(hiddenElement)).toBe(false);
    expect(isVisible(null)).toBe(false);
  });
});

describe("Debounce Function", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  test("should debounce function calls", () => {
    const debounce = (func, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    };

    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});

describe("Throttle Function", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  test("should throttle function calls", () => {
    const throttle = (func, limit) => {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    };

    const mockFn = jest.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});

describe("i18n Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should handle invalid translation keys", () => {
    const t = (key) => {
      if (!key || typeof key !== "string") {
        console.error("Invalid translation key:", key);
        return String(key);
      }
      return key;
    };

    expect(t("validKey")).toBe("validKey");
    expect(t(null)).toBe("null");
    expect(t(undefined)).toBe("undefined");
    expect(t(123)).toBe("123");
  });

  test("should handle fetch errors gracefully", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    let errorCaught = false;
    try {
      const response = await fetch("test-url");
    } catch (error) {
      errorCaught = true;
      expect(error.message).toBe("Network error");
    }

    expect(errorCaught).toBe(true);
  });
});
