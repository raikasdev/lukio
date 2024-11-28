<?php
header('Content-Type: application/json');

function getMondayFriday() {
    $today = new DateTime();
    $weekday = $today->format('N');
    
    // If it's Saturday (6) or Sunday (7), get next week's dates
    if ($weekday >= 6) {
        $monday = new DateTime('next monday');
    } else {
        $monday = new DateTime('monday this week');
    }
    
    $friday = clone $monday;
    $friday->modify('+4 days');
    
    return [
        $monday->format('Ymd'),
        $friday->format('Ymd')
    ];
}

function fetchAndCache($url, $cacheFile, $date, $date2) {
    $context = stream_context_create([
        'http' => [
            'timeout' => 3  // 3 second timeout
        ]
    ]);
    
    try {
        $data = @file_get_contents($url, false, $context);
        if ($data === false) {
            throw new Exception("Failed to fetch data");
        }
        
        // Validate JSON
        $json = json_decode($data);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON received");
        }
        
        // Load existing cache or create new cache structure
        $cacheData = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true) : [];
        
        // Update cache for this date range
        $cacheData[$date . '_' . $date2] = [
            'timestamp' => time(),
            'data' => $data
        ];
        
        // Save entire cache
        file_put_contents($cacheFile, json_encode($cacheData));
        
        header('X-Lukio-Cache: no');
        return $data;
    } catch (Exception $e) {
        // If fetch fails and cache exists, return cache
        if (file_exists($cacheFile)) {
            $cached = json_decode(file_get_contents($cacheFile), true);
            if (isset($cached[$date . '_' . $date2])) {
                header('X-Lukio-Cache: yes');
                return $cached[$date . '_' . $date2]['data'];
            }
        }
        http_response_code(503);
        return json_encode(['error' => 'Service temporarily unavailable']);
    }
}

// Get Monday and Friday dates
list($date, $date2) = getMondayFriday();

// Single cache file for all dates
$cacheFile = __DIR__ . "/menu_cache.json";

// Check if cache exists and is less than 1 hour old
if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    $cacheKey = $date . '_' . $date2;
    
    if (isset($cached[$cacheKey])) {
        $cacheAge = time() - $cached[$cacheKey]['timestamp'];
        
        if ($cacheAge < 3600) { // Less than 1 hour
            header('X-Lukio-Cache: yes');
            echo $cached[$cacheKey]['data'];
            exit;
        }
    }
}

// Build URL
$url = "https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/96665/4?" . 
       http_build_query([
           'lang' => 'fi',
           'date' => $date,
           'date2' => $date2
       ]);

// Fetch and cache
echo fetchAndCache($url, $cacheFile, $date, $date2);