<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
function reply($value,int $status=200):never {http_response_code($status);echo json_encode($value,JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);exit;}
try {$c=require __DIR__.'/config.php';}catch(Throwable $e){reply(['error'=>'Server configuration incomplete'],503);}
$origin=$_SERVER['HTTP_ORIGIN']??'';
if($origin===$c['allowed_origin']){
 header('Access-Control-Allow-Origin: '.$origin);
 header('Access-Control-Allow-Credentials: true');
 header('Vary: Origin');
}
if($_SERVER['REQUEST_METHOD']==='OPTIONS'){
 if($origin!==$c['allowed_origin'])reply(['error'=>'Origin denied'],403);
 header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
 header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
 http_response_code(204);exit;
}
try{$db=new PDO('mysql:host='.$c['db_host'].';dbname='.$c['db_name'].';charset=utf8mb4',$c['db_user'],$c['db_password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);}
catch(Throwable $e){reply(['error'=>'Database unavailable'],503);}
$keys=['whatsapp_number','hero_title','hero_intro','about_intro'];
if($_SERVER['REQUEST_METHOD']==='GET'){
 try{$rows=$db->query('SELECT setting_key,setting_value FROM site_settings')->fetchAll();}catch(Throwable $e){reply(['error'=>'Settings schema not installed'],503);}
 $data=[];foreach($rows as $row){if(in_array($row['setting_key'],$keys,true))$data[$row['setting_key']]=$row['setting_value'];}
 reply($data);
}
if($_SERVER['REQUEST_METHOD']!=='PUT')reply(['error'=>'Method not allowed'],405);
if(empty($_SERVER['HTTPS'])||$_SERVER['HTTPS']==='off')reply(['error'=>'HTTPS required'],403);
ini_set('session.use_strict_mode','1');ini_set('session.cookie_httponly','1');
ini_set('session.cookie_secure','1');ini_set('session.cookie_samesite','None');
session_start();
if(empty($_SESSION['admin']))reply(['error'=>'Login required'],401);
if(!hash_equals((string)($_SESSION['csrf']??''),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')))reply(['error'=>'Invalid CSRF token'],403);
$input=json_decode(file_get_contents('php://input'),true);
if(!is_array($input))reply(['error'=>'Invalid JSON'],400);
$number=preg_replace('/\D/','',(string)($input['whatsapp_number']??''));
if($number!==''&&(!preg_match('/^[1-9][0-9]{7,14}$/',$number)))reply(['error'=>'Invalid international WhatsApp number'],400);
$input['whatsapp_number']=$number;
foreach($keys as $key){if(!array_key_exists($key,$input)||!is_string($input[$key])||mb_strlen($input[$key])>600)reply(['error'=>'Invalid setting: '.$key],400);}
try{
 $db->beginTransaction();
 $stmt=$db->prepare('INSERT INTO site_settings (setting_key,setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
 foreach($keys as $key)$stmt->execute([$key,trim($input[$key])]);
 $db->commit();
}catch(Throwable $e){if($db->inTransaction())$db->rollBack();reply(['error'=>'Could not save settings'],500);}
reply(['ok'=>true]);
