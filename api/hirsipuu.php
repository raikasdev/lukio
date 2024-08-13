<?php
// phpcs:disable
header('Access-Control-Allow-Origin: *');

$words = file('./sanalista.txt');
$word = $words[ array_rand( $words ) ];

// Base64 encode it "just in case"
// Not a very "secure" way to hide the word from the plain API request, but a start.
echo base64_encode(trim($word));
