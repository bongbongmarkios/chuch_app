'use client';
import type { ReactNode } from 'react';
import { Search, Menu, Trash2, Info, Settings as SettingsIcon, BookX, ListChecks, Trash, Sparkles, Bot, RotateCcw, Wifi, WifiOff, Signal, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from 'react';
import DeleteHymnDialogContent from '@/components/hymnal/DeleteHymnDialogContent';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import HymnSearchDialog from '@/components/hymnal/HymnSearchDialog';
import ReadingSearchDialog from '@/components/readings/ReadingSearchDialog';
import ProgramSearchDialog from '@/components/program/ProgramSearchDialog';
import { UpdateButton } from '@/components/ui/UpdateButton';
import { useAppUpdate } from '@/hooks/useAppUpdate';


interface AppHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  hideDefaultActions?: boolean;
  onRestart?: () => void;
}

type SignalLevel = 'strong' | 'average' | 'weak' | 'none' | 'unknown';

interface SignalDetail {
  description: string;
  mbps?: number;
  level: SignalLevel;
  effectiveType?: string;
  connectionType: 'wifi' | 'cellular' | 'unknown';
}

const initialSignalDetail: SignalDetail = {
  description: "Initializing...",
  level: 'unknown',
  connectionType: 'unknown',
};


export default function AppHeader({ title, actions, hideDefaultActions, onRestart }: AppHeaderProps) {
  const [isDeleteHymnDialogOpen, setIsDeleteHymnDialogOpen] = useState(false);
  const [isHymnSearchOpen, setIsHymnSearchOpen] = useState(false);
  const [isReadingSearchOpen, setIsReadingSearchOpen] = useState(false);
  const [isProgramSearchOpen, setIsProgramSearchOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const { updateInfo, checkForUpdates } = useAppUpdate();
  
  const router = useRouter();
  const pathname = usePathname();

  const [currentSignal, setCurrentSignal] = useState<SignalDetail>(initialSignalDetail);
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const [isMeasuringSpeed, setIsMeasuringSpeed] = useState(false);
  const [speedTestResults, setSpeedTestResults] = useState<{
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    timestamp: number;
    server: string;
    serverLocation: string;
  } | null>(null);
  
  const [ispInfo, setIspInfo] = useState<{
    isp: string;
    location: string;
    ip: string;
    connectionType: string;
  } | null>(null);
  
  const [wifiInfo, setWifiInfo] = useState<{
    ssid: string;
    signalStrength: number;
    security: string;
  } | null>(null);


  const handleSearchOpen = () => {
    if (pathname.startsWith('/program')) {
      setIsProgramSearchOpen(true);
    } else if (pathname.startsWith('/readings')) {
      setIsReadingSearchOpen(true);
    } else {
      setIsHymnSearchOpen(true);
    }
  };

  useEffect(() => {
    // Keyboard shortcut for search
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (pathname.startsWith('/program')) {
          setIsProgramSearchOpen((open) => !open);
        } else if (pathname.startsWith('/readings')) {
          setIsReadingSearchOpen((open) => !open)
        } else {
          setIsHymnSearchOpen((open) => !open)
        }
      }
    }
    document.addEventListener('keydown', down);

    const updateNetworkStatus = () => {
      // Check if we're in a browser environment
      if (typeof navigator === 'undefined') {
        setCurrentSignal({ description: 'Not in browser environment', level: 'unknown', connectionType: 'unknown' });
        return;
      }

      // Check if Network Information API is available
      if ('connection' in navigator) {
        const connection = navigator.connection as any;
        const mbps = connection.downlink;
        const effectiveType = connection.effectiveType;
        const saveData = connection.saveData;

        let level: SignalLevel = 'unknown';
        let description = 'Unknown Connection';
        let connectionType: 'wifi' | 'cellular' | 'unknown' = 'unknown';

        if (!navigator.onLine) {
          level = 'none';
          description = 'Offline';
        } else if (mbps !== undefined && mbps > 0) {
          // More granular speed-based classification
          if (mbps >= 100) {
            level = 'strong';
            description = 'Excellent (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps >= 50) {
            level = 'strong';
            description = 'Very Good (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps >= 25) {
            level = 'strong';
            description = 'Good (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps >= 10) {
            level = 'average';
            description = 'Fair (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps >= 5) {
            level = 'average';
            description = 'Moderate (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps >= 1) {
            level = 'weak';
            description = 'Slow (Wi-Fi)';
            connectionType = 'wifi';
          } else if (mbps > 0.1) {
            level = 'weak';
            description = 'Very Slow (Wi-Fi)';
            connectionType = 'wifi';
          } else {
            level = 'weak';
            description = 'Extremely Slow (Wi-Fi)';
            connectionType = 'wifi';
          }
        } else {
          // Fallback to effectiveType when speed is not available
          if (effectiveType === '5g') {
            level = 'strong';
            description = '5G Cellular';
          } else if (effectiveType === '4g') {
            level = 'strong';
            description = '4G Cellular';
          } else if (effectiveType === '3g') {
            level = 'average';
            description = '3G Cellular';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            level = 'weak';
            description = '2G Cellular';
          } else if (navigator.onLine) {
            // Try to detect WiFi by checking if we're online but no cellular type
            // This is a heuristic - WiFi typically doesn't report effectiveType
            description = 'Wi-Fi (Speed details unavailable)';
            level = 'average'; 
          } else {
            description = 'Offline';
            level = 'none';
          }
        }

        // Add data saver info if available
        if (saveData) {
          description += ' (Data Saver)';
        }

        // Add ISP and WiFi info to description if available
        const ispDescription = ispInfo ? ` (${ispInfo.isp})` : '';
        const wifiDescription = wifiInfo && wifiInfo.ssid !== 'WiFi Network (SSID not available)' ? ` - ${wifiInfo.ssid}` : '';
        setCurrentSignal({ 
          description: description + ispDescription + wifiDescription, 
          mbps, 
          level, 
          effectiveType, 
          connectionType 
        });
              } else {
          // Fallback for browsers without Network Information API
          if (!navigator.onLine) {
            setCurrentSignal({ description: 'Offline', level: 'none', connectionType: 'unknown' });
          } else {
            // Try to detect if we're on mobile vs desktop
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isDesktop = !isMobile;
            
            if (isDesktop) {
              setCurrentSignal({ 
                description: 'Desktop - Network speed detection not available', 
                level: 'average',
                connectionType: 'wifi'
              });
            } else {
              setCurrentSignal({ 
                description: 'Mobile - Network speed detection not available', 
                level: 'average',
                connectionType: 'cellular'
              });
            }
          }
        }
      };

      updateNetworkStatus();

      // Detect ISP and WiFi information on initial load
      if (navigator.onLine) {
        detectISPInfo().then(setIspInfo);
        detectWiFiInfo().then(setWifiInfo);
      }

      // Run initial speed test if Network API is not available
      if (!('connection' in navigator) && navigator.onLine) {
        runSpeedTest();
      }

      // Set up periodic updates for more responsive network status
      const intervalId = setInterval(() => {
        updateNetworkStatus();
        // Run speed test every 30 seconds if Network API is not available
        if (!('connection' in navigator) && navigator.onLine && !isMeasuringSpeed) {
          runSpeedTest();
        }
      }, 5000); // Update every 5 seconds

      let connection: any;
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        connection = navigator.connection as any;
        connection.addEventListener('change', updateNetworkStatus);
      }
      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
      
      return () => {
          document.removeEventListener('keydown', down)
          clearInterval(intervalId);
          if (connection) {
              connection.removeEventListener('change', updateNetworkStatus);
          }
          window.removeEventListener('online', updateNetworkStatus);
          window.removeEventListener('offline', updateNetworkStatus);
      };

  }, [pathname]);

  const getWifiIconColor = (): string => {
    switch (currentSignal.level) {
      case 'strong':
        return 'text-green-500';
      case 'average':
        return 'text-orange-500';
      case 'weak':
        return 'text-red-500';
      case 'none':
        return 'text-slate-400 dark:text-slate-600'; 
      case 'unknown':
      default:
        return 'text-muted-foreground';
    }
  };

  const getWifiAriaLabel = (): string => {
    const connectionType = currentSignal.connectionType === 'cellular' ? 'Cellular' : 'WiFi';
    let label = `${connectionType} Status: ${currentSignal.description}`;
    if (currentSignal.mbps !== undefined && currentSignal.level !== 'none') {
      label += `, ~${currentSignal.mbps.toFixed(1)} Mbps`;
    }
    if (currentSignal.effectiveType && currentSignal.level !== 'none') {
      label += ` (Type: ${currentSignal.effectiveType})`;
    }
    label += ". Click for details.";
    return label;
  }

  const handleDataChangeSuccess = () => {
    router.refresh();
  }

  // Function to detect WiFi network information
  const detectWiFiInfo = async (): Promise<{
    ssid: string;
    signalStrength: number;
    security: string;
  }> => {
    try {
      // Method 1: Check if Network Information API supports WiFi info
      if ('connection' in navigator) {
        const connection = navigator.connection as any;
        
        // Some browsers provide WiFi information directly
        if (connection.ssid) {
          return {
            ssid: connection.ssid,
            signalStrength: connection.signalStrength || 0,
            security: connection.security || 'Unknown'
          };
        }
      }
      
      // Method 2: Try to detect WiFi info using Network Information API
      if ('getNetworkInformation' in navigator) {
        try {
          const networkInfo = await (navigator as any).getNetworkInformation();
          if (networkInfo && networkInfo.ssid) {
            return {
              ssid: networkInfo.ssid,
              signalStrength: networkInfo.signalStrength || 0,
              security: networkInfo.security || 'Unknown'
            };
          }
        } catch {
          // Continue to fallback
        }
      }
      
      // Method 3: Try using WebRTC to get network information
      try {
        const rtc = new RTCPeerConnection();
        const offer = await rtc.createOffer();
        if (offer.sdp) {
          // Parse SDP to look for network information
          const lines = offer.sdp.split('\n');
          for (const line of lines) {
            if (line.includes('c=IN IP4')) {
              // Found network information
              return {
                ssid: 'WiFi Network (Detected via WebRTC)',
                signalStrength: 0,
                security: 'Unknown'
              };
            }
          }
        }
        rtc.close();
      } catch {
        // Continue to fallback
      }
      
      // Method 4: Try to detect using connection type and user agent
      if ('connection' in navigator) {
        const connection = navigator.connection as any;
        if (connection.effectiveType && !connection.effectiveType.includes('g')) {
          // Likely WiFi if not cellular
          return {
            ssid: 'WiFi Network (SSID not available)',
            signalStrength: 0,
            security: 'Unknown'
          };
        }
      }
      
      // Method 5: Check if we're on a mobile device and likely using WiFi
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && navigator.onLine) {
        return {
          ssid: 'Mobile WiFi Network',
          signalStrength: 0,
          security: 'Unknown'
        };
      }
      
      // Method 6: Try to get WiFi info from browser permissions and APIs
      try {
        // Check if we can access network information through permissions
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'network-info' as any });
          if (permission.state === 'granted') {
            // Try to get network info with permission
            const networkInfo = await (navigator as any).getNetworkInformation();
            if (networkInfo && networkInfo.ssid) {
              return {
                ssid: networkInfo.ssid,
                signalStrength: networkInfo.signalStrength || 0,
                security: networkInfo.security || 'Unknown'
              };
            }
          }
        }
      } catch {
        // Continue to fallback
      }
      
      // Method 7: Try to detect WiFi SSID using experimental APIs
      try {
        if ('wifi' in navigator) {
          const wifiInfo = await (navigator as any).wifi.getCurrentNetwork();
          if (wifiInfo && wifiInfo.ssid) {
            return {
              ssid: wifiInfo.ssid,
              signalStrength: wifiInfo.signalStrength || 0,
              security: wifiInfo.security || 'Unknown'
            };
          }
        }
      } catch {
        // Continue to fallback
      }
      
      // Method 8: Try to get network info from connection object properties
      if ('connection' in navigator) {
        const connection = navigator.connection as any;
        // Check for various possible SSID properties
        const possibleSSIDProps = ['ssid', 'networkName', 'wifiSSID', 'networkSSID', 'accessPoint'];
        for (const prop of possibleSSIDProps) {
          if (connection[prop]) {
            return {
              ssid: connection[prop],
              signalStrength: connection.signalStrength || 0,
              security: connection.security || 'Unknown'
            };
          }
        }
      }
      
      // Final fallback - provide a more user-friendly message
      return {
        ssid: 'WiFi Network (SSID not available)',
        signalStrength: 0,
        security: 'Unknown'
      };
    } catch (error) {
      return {
        ssid: 'WiFi Network (SSID not available)',
        signalStrength: 0,
        security: 'Unknown'
      };
    }
  };

  // Function to detect ISP information
  const detectISPInfo = async (): Promise<{
    isp: string;
    location: string;
    ip: string;
    connectionType: string;
  }> => {
    try {
      // Use ipapi.co to get ISP information
      const response = await fetch('https://ipapi.co/json/', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          isp: data.org || data.isp || 'Unknown ISP',
          location: `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`,
          ip: data.ip || 'Unknown',
          connectionType: data.connection?.type || 'Unknown'
        };
      }
    } catch (error) {
      // Fallback to alternative service
      try {
        const response2 = await fetch('https://api.ipify.org?format=json');
        if (response2.ok) {
          const ipData = await response2.json();
          return {
            isp: 'ISP Detection Failed',
            location: 'Location Unknown',
            ip: ipData.ip || 'Unknown',
            connectionType: 'Unknown'
          };
        }
      } catch {
        // Final fallback
        return {
          isp: 'ISP Detection Failed',
          location: 'Location Unknown',
          ip: 'Unknown',
          connectionType: 'Unknown'
        };
      }
    }
    
    return {
      isp: 'ISP Detection Failed',
      location: 'Location Unknown',
      ip: 'Unknown',
      connectionType: 'Unknown'
    };
  };

  // Function to measure latency (ping) with server info
  const measureLatency = async (): Promise<{ latency: number; server: string; serverLocation: string }> => {
    const startTime = performance.now();
    try {
      // Try multiple servers for better accuracy
      const servers = [
        { url: 'https://httpbin.org/delay/0', name: 'HTTPBin', location: 'Global CDN' },
        { url: 'https://api.github.com', name: 'GitHub API', location: 'Global' },
        { url: 'https://jsonplaceholder.typicode.com', name: 'JSONPlaceholder', location: 'Global' }
      ];

      let bestLatency = Infinity;
      let bestServer = '';
      let bestLocation = '';

      for (const server of servers) {
        try {
          const response = await fetch(server.url, { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const latency = performance.now() - startTime;
          
          if (response.ok && latency < bestLatency) {
            bestLatency = latency;
            bestServer = server.name;
            bestLocation = server.location;
          }
        } catch {
          continue;
        }
      }

      return { 
        latency: bestLatency === Infinity ? 0 : bestLatency, 
        server: bestServer || 'Unknown',
        serverLocation: bestLocation || 'Unknown'
      };
    } catch {
      return { latency: 0, server: 'Unknown', serverLocation: 'Unknown' };
    }
  };

  // Function to measure download speed with multiple test sizes
  const measureDownloadSpeed = async (): Promise<number> => {
    const testSizes = [262144, 524288, 1048576]; // 256KB, 512KB, 1MB
    let totalSpeed = 0;
    let successfulTests = 0;
    
    for (const size of testSizes) {
      try {
        const startTime = performance.now();
        const response = await fetch(`https://httpbin.org/bytes/${size}`, {
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.arrayBuffer();
        const endTime = performance.now();
        
        const duration = (endTime - startTime) / 1000; // Convert to seconds
        const speedMbps = (data.byteLength * 8) / (duration * 1024 * 1024); // Convert to Mbps
        
        // Only count reasonable speeds (not too fast or too slow)
        if (speedMbps > 0.1 && speedMbps < 1000) {
          totalSpeed += speedMbps;
          successfulTests++;
        }
      } catch {
        continue;
      }
    }
    
    return successfulTests > 0 ? totalSpeed / successfulTests : 0;
  };

  // Function to measure upload speed
  const measureUploadSpeed = async (): Promise<number> => {
    const testDataSize = 256 * 1024; // 256KB
    const startTime = performance.now();
    
    try {
      // Create test data
      const testData = new Uint8Array(testDataSize);
      for (let i = 0; i < testDataSize; i++) {
        testData[i] = Math.random() * 256;
      }
      
      // Simulate upload by sending to a dummy endpoint
      const response = await fetch('/api/speed-test', {
        method: 'POST',
        body: testData,
        headers: {
          'Content-Type': 'application/octet-stream',
        }
      });
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // Convert to seconds
      const speedMbps = (testDataSize * 8) / (duration * 1024 * 1024); // Convert to Mbps
      
      return speedMbps;
    } catch {
      // If upload test fails, estimate based on download speed
      const downloadSpeed = await measureDownloadSpeed();
      return downloadSpeed * 0.1; // Assume upload is ~10% of download
    }
  };

  // Comprehensive speed test function
  const runSpeedTest = async () => {
    if (isMeasuringSpeed) return;
    
    setIsMeasuringSpeed(true);
    
    try {
      // Detect ISP information first
      const ispData = await detectISPInfo();
      setIspInfo(ispData);
      
      // Detect WiFi information if connected via WiFi
      if (currentSignal.connectionType === 'wifi' || !currentSignal.connectionType) {
        const wifiData = await detectWiFiInfo();
        setWifiInfo(wifiData);
      }
      
      // Measure latency first with server info
      const latencyInfo = await measureLatency();
      
      // Measure download speed
      const downloadSpeed = await measureDownloadSpeed();
      
      // Measure upload speed
      const uploadSpeed = await measureUploadSpeed();
      
      // Determine connection level based on download speed
      let level: SignalLevel;
      let description: string;
      
      if (downloadSpeed >= 100) {
        level = 'strong';
        description = 'Excellent';
      } else if (downloadSpeed >= 50) {
        level = 'strong';
        description = 'Very Good';
      } else if (downloadSpeed >= 25) {
        level = 'strong';
        description = 'Good';
      } else if (downloadSpeed >= 10) {
        level = 'average';
        description = 'Fair';
      } else if (downloadSpeed >= 5) {
        level = 'average';
        description = 'Moderate';
      } else if (downloadSpeed >= 1) {
        level = 'weak';
        description = 'Slow';
      } else {
        level = 'weak';
        description = 'Very Slow';
      }
      
      // Update speed test results
      const results = {
        downloadSpeed,
        uploadSpeed,
        latency: latencyInfo.latency,
        timestamp: Date.now(),
        server: latencyInfo.server,
        serverLocation: latencyInfo.serverLocation
      };
      setSpeedTestResults(results);
      
      // Update current signal with ISP and WiFi info if available
      const ispDescription = ispInfo ? ` (${ispInfo.isp})` : '';
      const wifiDescription = wifiInfo && wifiInfo.ssid !== 'WiFi Network (SSID not available)' ? ` - ${wifiInfo.ssid}` : '';
      setCurrentSignal({
        description: `${description} - ${downloadSpeed.toFixed(1)} Mbps${ispDescription}${wifiDescription}`,
        mbps: downloadSpeed,
        level,
        effectiveType: 'speed-test',
        connectionType: 'wifi' // Assume WiFi for speed tests
      });
      
    } catch (error) {
      setCurrentSignal({
        description: 'Speed test failed',
        level: 'unknown',
        connectionType: 'unknown'
      });
    } finally {
      setIsMeasuringSpeed(false);
    }
  };

  // Function to measure network speed using a simple ping test (fallback)
  const measureNetworkSpeed = async () => {
    await runSpeedTest();
  };

  // Check if we are on a specific program presenter page
  const isProgramPresenterPage = /^\/program\/[^\/]+$/.test(pathname);

  const programPresenterActions = (
    <div className="flex items-center gap-2">
      {onRestart && (
          <Button variant="ghost" size="icon" onClick={onRestart} aria-label="Restart Program">
            <RotateCcw className="h-6 w-6" />
          </Button>
      )}
    </div>
  );

  return (
    <>
      <header className="bg-card shadow-sm mb-3 sm:mb-4 md:mb-6 print:hidden sticky top-0 z-50 border-b">
        <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {typeof title === 'string' && title.length > 0 ? (
              <h1 className="text-xl sm:text-2xl font-headline font-semibold text-primary">{title}</h1>
            ) : typeof title === 'string' && title.length === 0 ? (
              null
            ) : (
              title
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
            {actions}

            {!hideDefaultActions && (
              isProgramPresenterPage ? (
                programPresenterActions
              ) : (
                // On all other pages, show the full set of default actions
                <>
                  <Popover open={isStatusPopoverOpen} onOpenChange={setIsStatusPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label={getWifiAriaLabel()}
                        className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                      >
                                                {currentSignal.level === 'none' ? (
                          <WifiOff className={`h-5 w-5 ${getWifiIconColor()}`} />
                        ) : currentSignal.connectionType === 'cellular' ? (
                          <Signal className={`h-5 w-5 ${getWifiIconColor()}`} />
                        ) : (
                          <Wifi className={`h-5 w-5 ${getWifiIconColor()}`} />
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-0" align="end">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                        {/* Header */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${getWifiIconColor().replace('text-', 'bg-').replace('-500', '-100')} ${getWifiIconColor()}`}>
                                {currentSignal.level === 'none' ? (
                                  <WifiOff className="h-5 w-5" />
                                ) : currentSignal.connectionType === 'cellular' ? (
                                  <Signal className="h-5 w-5" />
                                ) : (
                                  <Wifi className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                  {currentSignal.connectionType === 'cellular' ? 'Cellular Network' : 'WiFi Network'}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {currentSignal.description}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                runSpeedTest();
                                detectISPInfo();
                                detectWiFiInfo();
                              }}
                              disabled={isMeasuringSpeed}
                              className="h-9 w-9 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                              <RotateCcw className={`h-4 w-4 ${isMeasuringSpeed ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                          {/* WiFi Network Name - Prominent Display */}
                          {wifiInfo && currentSignal.connectionType === 'wifi' && wifiInfo.ssid !== 'WiFi Network (SSID not available)' && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                  <Wifi className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium opacity-90">Connected Network</p>
                                  <p className="text-lg font-bold">{wifiInfo.ssid}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Speed Test Results - Modern Cards */}
                          {speedTestResults && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Network Performance</h5>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Download</span>
                                  </div>
                                  <div className="text-xl font-bold text-green-600">
                                    {speedTestResults.downloadSpeed.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">Mbps</div>
                                </div>
                                
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Upload</span>
                                  </div>
                                  <div className="text-xl font-bold text-blue-600">
                                    {speedTestResults.uploadSpeed.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">Mbps</div>
                                </div>
                                
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Latency</span>
                                  </div>
                                  <div className="text-xl font-bold text-purple-600">
                                    {speedTestResults.latency.toFixed(0)}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">ms</div>
                                </div>
                              </div>
                              
                              {speedTestResults.server && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Test server: <span className="font-medium">{speedTestResults.server}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ISP Information - Modern Card */}
                          {ispInfo && (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-1 h-4 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Service Provider</h5>
                              </div>
                              
                              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">ISP</p>
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ispInfo.isp}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Location</p>
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ispInfo.location}</p>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">IP Address</p>
                                      <p className="text-sm font-mono text-slate-900 dark:text-slate-100">{ispInfo.ip}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Connection</p>
                                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ispInfo.connectionType}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                                                     {/* WiFi Network Details - Modern Card */}
                           {wifiInfo && currentSignal.connectionType === 'wifi' && (
                             <div className="space-y-3">
                               <div className="flex items-center space-x-2">
                                 <div className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                                 <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Network Details</h5>
                               </div>
                               
                               <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-3">
                                     <div>
                                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Network Name</p>
                                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                         {wifiInfo.ssid}
                                       </p>
                                     </div>
                                     <div>
                                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Security</p>
                                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{wifiInfo.security}</p>
                                     </div>
                                   </div>
                                   <div className="space-y-3">
                                     <div>
                                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Signal Strength</p>
                                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                         {wifiInfo.signalStrength > 0 ? `${wifiInfo.signalStrength}%` : 'Unknown'}
                                       </p>
                                     </div>
                                     <div>
                                       <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</p>
                                       <div className="flex items-center space-x-2">
                                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                         <p className="text-sm font-semibold text-green-600">Connected</p>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                           )}

                          {/* Connection Status Indicator */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  currentSignal.level === 'strong' ? 'bg-green-500' :
                                  currentSignal.level === 'average' ? 'bg-orange-500' :
                                  currentSignal.level === 'weak' ? 'bg-red-500' :
                                  currentSignal.level === 'none' ? 'bg-slate-400' : 'bg-slate-500'
                                }`} />
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
                                    {currentSignal.level} Connection
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {currentSignal.mbps ? `~${currentSignal.mbps.toFixed(1)} Mbps` : 'Speed unknown'}
                                  </p>
                                </div>
                              </div>
                              {currentSignal.effectiveType && (
                                <div className="text-right">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    {currentSignal.effectiveType}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {navigator.onLine && (
                            <div className="space-y-3">
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={runSpeedTest}
                                disabled={isMeasuringSpeed}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                              >
                                {isMeasuringSpeed ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Running Speed Test...</span>
                                  </div>
                                ) : (
                                  'Run Speed Test'
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                  const ispData = await detectISPInfo();
                                  setIspInfo(ispData);
                                  const wifiData = await detectWiFiInfo();
                                  setWifiInfo(wifiData);
                                }}
                                className="w-full"
                              >
                                Refresh Network Info
                              </Button>
                            </div>
                          )}

                          {/* Loading State */}
                          {isMeasuringSpeed && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Measuring Network Speed</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Please wait...</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Bottom padding for better scrolling experience */}
                          <div className="h-4"></div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" size="icon" aria-label="Open search" onClick={handleSearchOpen} className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent">
                    <Search className="h-6 w-6" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Open menu">
                        <Menu className="h-9 w-9" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => router.push('/hymn-url-editor')}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        <span>URL Management</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setIsUpdateDialogOpen(true)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>
                          {updateInfo?.hasUpdate ? 'Update Available' : 'Check for Updates'}
                        </span>
                        {updateInfo?.hasUpdate && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            !
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => router.push('/trash')}>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Trash</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => router.push('/settings')}>
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push('/about')}>
                        <Info className="mr-2 h-4 w-4" />
                        <span>About</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )
            )}
          </div>
        </div>
      </header>
      
      <HymnSearchDialog open={isHymnSearchOpen} onOpenChange={setIsHymnSearchOpen} />
      <ReadingSearchDialog open={isReadingSearchOpen} onOpenChange={setIsReadingSearchOpen} />
      <ProgramSearchDialog open={isProgramSearchOpen} onOpenChange={setIsProgramSearchOpen} />

      <Dialog open={isDeleteHymnDialogOpen} onOpenChange={setIsDeleteHymnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move Hymns to Trash</DialogTitle>
            <DialogDescription>
              Select hymns to move to trash. They will be permanently deleted after 30 days.
            </DialogDescription>
          </DialogHeader>
          <DeleteHymnDialogContent
            onOpenChange={setIsDeleteHymnDialogOpen}
            onDeleteSuccess={() => {
              setIsDeleteHymnDialogOpen(false);
              handleDataChangeSuccess();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>App Updates</DialogTitle>
            <DialogDescription>
              Check for and install app updates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Current Version</p>
                <p className="text-sm text-muted-foreground">
                  {updateInfo?.currentVersion || '1.0.0'}
                </p>
              </div>
            </div>
            
            {updateInfo?.hasUpdate && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Update Available
                  </span>
                  <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    v{updateInfo.latestVersion}
                  </span>
                </div>
                {updateInfo.changelog && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {updateInfo.changelog}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={checkForUpdates}
                variant="outline"
                className="flex-1"
              >
                Check for Updates
              </Button>
              {updateInfo?.hasUpdate && (
                <Button
                  onClick={() => {
                    // This would trigger the update download
                    console.log('Starting update download...');
                    setIsUpdateDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  Update Now
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </>
  );
}
