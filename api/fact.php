<?php
// phpcs:disable
header('Cache-Control: max-age=60');
include 'vendor/autoload.php';

$facts = file('./wikipedia_facts.txt');
$Parsedown = new Parsedown();
echo $Parsedown->text('Tiesitkö että ' . $facts[ array_rand( $facts ) ] ); 

