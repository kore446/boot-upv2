import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ─── BOARDS & SENSORS DATA ────────────────────────────────────────────────────
const BOARDS = {
  "arduino uno":         {title:"ARDUINO UNO R3",        specs:"ATmega328P · 16MHz · 32KB Flash · 14 Digital I/O · 6 Analog In",           color:0x1a5c99,size:[5.4,0.2,6.8], shape:"uno"},
  "arduino mega":        {title:"ARDUINO MEGA 2560",     specs:"ATmega2560 · 16MHz · 256KB Flash · 54 Digital I/O · 16 Analog In",          color:0x1a5c99,size:[5.3,0.2,10.1],shape:"mega"},
  "arduino nano":        {title:"ARDUINO NANO",          specs:"ATmega328P · 16MHz · 32KB Flash · 22 I/O · Mini Form Factor",               color:0x1a5c99,size:[1.8,0.15,4.3],shape:"nano"},
  "arduino pro mini":    {title:"ARDUINO PRO MINI",      specs:"ATmega328P · 8/16MHz · 32KB Flash · Ultra Compact · 3.3V/5V",              color:0x8B0000,size:[1.8,0.12,3.3],shape:"nano"},
  "arduino due":         {title:"ARDUINO DUE",           specs:"SAM3X8E ARM · 84MHz · 512KB Flash · 54 Digital I/O · USB-OTG",             color:0x006080,size:[5.3,0.2,10.1],shape:"mega"},
  "arduino leonardo":    {title:"ARDUINO LEONARDO",      specs:"ATmega32U4 · 16MHz · 32KB Flash · Native USB · HID Support",               color:0x006040,size:[4.5,0.2,6.8], shape:"uno"},
  "arduino micro":       {title:"ARDUINO MICRO",         specs:"ATmega32U4 · 16MHz · 32KB Flash · Native USB · Breadboard-friendly",       color:0x006040,size:[1.8,0.15,4.8],shape:"nano"},
  "arduino nano every":  {title:"ARDUINO NANO EVERY",    specs:"ATmega4809 · 20MHz · 48KB Flash · 22 I/O · 5V",                            color:0x1a5c99,size:[1.8,0.15,4.5],shape:"nano"},
  "arduino nano 33 iot": {title:"ARDUINO NANO 33 IoT",   specs:"SAMD21 · 48MHz · 256KB Flash · WiFi+BT · 22 I/O · 3.3V",                  color:0x006080,size:[1.8,0.15,4.5],shape:"nano"},
  "arduino nano 33 ble": {title:"ARDUINO NANO 33 BLE",   specs:"nRF52840 · 64MHz · 1MB Flash · BLE 5.0 · 9-axis IMU · 3.3V",              color:0x555555,size:[1.8,0.15,4.5],shape:"nano"},
  "arduino mkr zero":    {title:"ARDUINO MKR ZERO",      specs:"SAMD21 · 48MHz · 256KB Flash · SD Card · I2S Audio · 3.3V",               color:0xeeeeee,size:[2.5,0.15,6.1],shape:"nano"},
  "arduino mkr wifi":    {title:"ARDUINO MKR WiFi 1010", specs:"SAMD21 · 48MHz · 256KB · WiFi+BT · u-blox NINA-W102 · 3.3V",              color:0x2244aa,size:[2.5,0.15,6.1],shape:"nano"},
  "arduino giga r1":     {title:"ARDUINO GIGA R1 WiFi",  specs:"STM32H747XI · 480MHz Dual-Core · 2MB Flash · 76 I/O · WiFi+BT",           color:0x003366,size:[5.3,0.2,13.0],shape:"mega"},
  "arduino portenta h7": {title:"ARDUINO PORTENTA H7",   specs:"STM32H747 · 480MHz+240MHz · 2MB Flash · WiFi+BT+Ethernet · 77 I/O",       color:0x111111,size:[3.3,0.2,6.6], shape:"nano"},
  "arduino r4 wifi":     {title:"ARDUINO UNO R4 WiFi",   specs:"RA4M1 · 48MHz · 256KB Flash · WiFi+BT · LED Matrix · 14 Digital I/O",    color:0x006680,size:[5.4,0.2,6.8], shape:"uno"},
  "arduino r4 minima":   {title:"ARDUINO UNO R4 MINIMA", specs:"RA4M1 · 48MHz · 256KB Flash · 14 Digital I/O · DAC · CAN · 6 Analog",    color:0x006680,size:[5.4,0.2,6.8], shape:"uno"},
  "esp32":               {title:"ESP32 DEVKIT V1",       specs:"Dual-core Xtensa LX6 · 240MHz · 4MB Flash · WiFi+BT · 34 GPIO",           color:0x1a1a1a,size:[2.8,0.15,5.2],shape:"esp"},
  "esp32 s3":            {title:"ESP32-S3 DEVKIT",       specs:"Xtensa LX7 Dual-Core · 240MHz · 8MB Flash · WiFi+BT5 · USB OTG · 45 GPIO",color:0x1a1a1a,size:[2.9,0.15,5.4],shape:"esp"},
  "esp32 c3":            {title:"ESP32-C3 MINI",         specs:"RISC-V Single-Core · 160MHz · 4MB Flash · WiFi+BT5 · 22 GPIO · 3.3V",     color:0x222222,size:[2.0,0.12,3.8],shape:"nano"},
  "esp8266":             {title:"ESP8266 NodeMCU v2",    specs:"Xtensa L106 · 80MHz · 4MB Flash · 802.11b/g/n WiFi · 11 GPIO",            color:0x1a1a1a,size:[3.0,0.15,5.8],shape:"esp"},
  "esp32 cam":           {title:"ESP32-CAM",             specs:"ESP32-S · 240MHz · 4MB Flash · OV2640 2MP Camera · WiFi+BT · microSD",    color:0x222200,size:[2.7,0.2,4.0], shape:"nano"},
  "wemos d1 mini":       {title:"WEMOS D1 MINI",         specs:"ESP8266 · 80MHz · 4MB Flash · WiFi · 11 GPIO · USB-C · Mini form",         color:0x222222,size:[2.6,0.15,3.4],shape:"nano"},
  "nodemcu":             {title:"NodeMCU ESP8266 v3",    specs:"ESP8266 · 80MHz · 4MB Flash · WiFi · 11 GPIO · USB-Serial · 3.3V",        color:0x1a1a1a,size:[3.0,0.15,5.8],shape:"esp"},
  "raspberry pi 5":      {title:"RASPBERRY PI 5",        specs:"BCM2712 Quad-Core A76 · 2.4GHz · 4/8GB LPDDR4X · PCIe 2.0 · 40-pin GPIO",color:0x7a1010,size:[6.8,0.2,9.0], shape:"rpi"},
  "raspberry pi 4":      {title:"RASPBERRY PI 4B",       specs:"BCM2711 Quad-Core A72 · 1.8GHz · 2/4/8GB LPDDR4 · USB-C · Dual HDMI",    color:0x7a1010,size:[6.8,0.2,8.8], shape:"rpi"},
  "raspberry pi 3":      {title:"RASPBERRY PI 3B+",      specs:"BCM2837B0 Quad-Core A53 · 1.4GHz · 1GB RAM · WiFi+BT · 40-pin GPIO",      color:0x7a1010,size:[6.8,0.2,8.5], shape:"rpi"},
  "raspberry pi zero":   {title:"RASPBERRY PI ZERO 2W",  specs:"RP3A0 Quad-Core · 1GHz · 512MB RAM · WiFi+BT · 40-pin GPIO · Mini HDMI",  color:0x228800,size:[3.0,0.12,6.5], shape:"nano"},
  "raspberry pi pico":   {title:"RASPBERRY PI PICO W",   specs:"RP2040 Dual-Core · 133MHz · 264KB SRAM · 26 GPIO · WiFi · USB 1.1",       color:0x006040,size:[2.1,0.12,5.1],shape:"nano"},
  "raspberry pi pico 2": {title:"RASPBERRY PI PICO 2",   specs:"RP2350 Dual-Core · 150MHz · 520KB SRAM · 48 GPIO · USB",                  color:0x005030,size:[2.1,0.12,5.1],shape:"nano"},
  "stm32":               {title:"STM32 BLUE PILL",       specs:"STM32F103C8 · 72MHz · 64KB Flash · 37 GPIO · CAN/USB/SPI/I2C",            color:0x1a1a6e,size:[2.3,0.12,5.3],shape:"nano"},
  "stm32 black pill":    {title:"STM32 BLACK PILL",      specs:"STM32F411CE · 100MHz · 512KB Flash · 36 GPIO · USB-C · SPI/I2C/UART",     color:0x111111,size:[2.1,0.12,5.3],shape:"nano"},
  "stm32 nucleo":        {title:"STM32 NUCLEO-F103RB",   specs:"STM32F103RB · 72MHz · 128KB Flash · 51 GPIO · Arduino+Morpho headers",    color:0x006644,size:[5.0,0.2,8.0], shape:"uno"},
  "teensy 4.1":          {title:"TEENSY 4.1",            specs:"iMXRT1062 · 600MHz · 8MB Flash · 55 I/O · USB Host/Device · SD Card",     color:0x003388,size:[1.8,0.15,6.1],shape:"nano"},
  "teensy 4.0":          {title:"TEENSY 4.0",            specs:"iMXRT1062 · 600MHz · 2MB Flash · 40 I/O · USB · Floating Point Unit",     color:0x003388,size:[1.8,0.15,3.5],shape:"nano"},
  "attiny85":            {title:"ATTINY85 DIGISPARK",    specs:"ATtiny85 · 16MHz · 8KB Flash · 6 I/O · USB · Tiny 25x18mm PCB",           color:0x1a5c99,size:[2.5,0.12,1.8],shape:"nano"},
  "micro:bit":           {title:"BBC MICRO:BIT v2",      specs:"nRF52833 · 64MHz · 512KB Flash · 25 LED Matrix · BLE · I2C/SPI/UART",     color:0xffcc00,size:[4.3,0.15,5.2],shape:"nano"},
  "lolin32":             {title:"LOLIN32 LITE",          specs:"ESP32 · 240MHz · 4MB Flash · WiFi+BT · LiPo charger · 26 GPIO",           color:0x111122,size:[2.6,0.15,5.5],shape:"nano"},
};

const SENSORS = {
  "hc-sr04":        {title:"HC-SR04 ULTRASONIC",    specs:"Distance: 2-400cm · ±3mm · 5V · Trigger+Echo · 40kHz",                 type:"hcsr04",   pins:4},
  "ultrasonic":     {title:"HC-SR04 ULTRASONIC",    specs:"Distance: 2-400cm · ±3mm · 5V · Trigger+Echo · 40kHz",                 type:"hcsr04",   pins:4},
  "pir":            {title:"HC-SR501 PIR",           specs:"Detection: 3-7m · 120° angle · 5-20V · Adjustable delay & sensitivity", type:"pir",      pins:3},
  "ir sensor":      {title:"IR OBSTACLE SENSOR",    specs:"Detection: 2-30cm · Digital out · 5V · Adjustable · TCRT5000",          type:"ir",       pins:3},
  "dht22":          {title:"DHT22 TEMP/HUMIDITY",   specs:"Temp: -40-80°C ±0.5°C · Humidity: 0-100% ±2% · Single-wire · 3-5V",    type:"dht22",    pins:3},
  "dht11":          {title:"DHT11 TEMP/HUMIDITY",   specs:"Temp: 0-50°C ±2°C · Humidity: 20-80% ±5% · Single-wire · 3-5V",        type:"dht11",    pins:3},
  "ds18b20":        {title:"DS18B20 TEMP PROBE",    specs:"Temp: -55-125°C ±0.5°C · 1-Wire · 3-5.5V · Waterproof probe",          type:"ds18b20",  pins:3},
  "bmp280":         {title:"BMP280 PRESSURE/TEMP",  specs:"Pressure: 300-1100hPa · Temp: -40-85°C · I2C/SPI · 1.71-3.6V",         type:"bmp280",   pins:4},
  "bme280":         {title:"BME280 ENVIRONMENT",    specs:"Temp + Humidity + Pressure · I2C/SPI · ±1°C ±3% RH · 1.71-3.6V",       type:"bmp280",   pins:4},
  "mpu6050":        {title:"MPU-6050 IMU",          specs:"6-DoF: 3-axis gyro + accel · I2C · ±16g · ±2000°/s · DMP",             type:"imu",      pins:4},
  "mpu9250":        {title:"MPU-9250 9-DOF IMU",    specs:"9-DoF: Gyro+Accel+Magnetometer · I2C/SPI · ±16g · AK8963",             type:"imu",      pins:4},
  "hmc5883l":       {title:"HMC5883L COMPASS",      specs:"3-axis magnetometer · I2C · ±8 Gauss · 160Hz · 2.16-3.6V",             type:"imu",      pins:4},
  "adxl345":        {title:"ADXL345 ACCELEROMETER", specs:"3-axis accel · ±16g · I2C/SPI · 2-3.6V · Tap/freefall detection",      type:"imu",      pins:4},
  "mq2":            {title:"MQ-2 GAS SENSOR",       specs:"LPG/Smoke/H2/Methane · Analog+Digital · 5V · 20s preheat",             type:"mq",       pins:4},
  "mq135":          {title:"MQ-135 AIR QUALITY",    specs:"CO2/NH3/NOx/Benzene/Smoke · Analog+Digital · 5V · AQI",                type:"mq",       pins:4},
  "mq7":            {title:"MQ-7 CO SENSOR",        specs:"Carbon Monoxide 20-2000ppm · Analog+Digital · 5V · Heating cycle",     type:"mq",       pins:4},
  "ldr":            {title:"LDR LIGHT SENSOR",      specs:"Resistance: 1kΩ-10MΩ · Analog out · 3.3-5V · GL5528",                 type:"ldr",      pins:2},
  "bh1750":         {title:"BH1750 LIGHT METER",    specs:"Light: 1-65535 lux · I2C · 3-5V · 16-bit · Visible spectrum",         type:"imu",      pins:4},
  "tcs34725":       {title:"TCS34725 COLOR SENSOR", specs:"RGB + Clear · I2C · 3.3V · IR filter · White LED · ±3% accuracy",      type:"imu",      pins:4},
  "oled":           {title:"OLED 0.96\" SSD1306",   specs:"128x64px · SSD1306 · I2C/SPI · 3.3-5V · 0.96 inch",                   type:"oled",     pins:4},
  "oled 1.3":       {title:"OLED 1.3\" SH1106",     specs:"128x64px · SH1106 · I2C · 3.3-5V · 1.3 inch",                         type:"oled",     pins:4},
  "lcd 16x2":       {title:"LCD 16x2 DISPLAY",      specs:"16 chars x 2 rows · HD44780 · 5V · I2C backpack · Blue backlight",     type:"lcd",      pins:4},
  "lcd 20x4":       {title:"LCD 20x4 DISPLAY",      specs:"20 chars x 4 rows · HD44780 · 5V · I2C backpack · Blue backlight",     type:"lcd",      pins:4},
  "neopixel":       {title:"WS2812B NEOPIXEL RING", specs:"12 RGB LEDs · 5V · Single data wire · 256 levels per channel",         type:"neopixel", pins:3},
  "servo":          {title:"SG90 MICRO SERVO",      specs:"Torque: 1.8kg·cm · Speed: 0.1s/60° · 4.8-6V · 180° rotation",         type:"servo",    pins:3},
  "relay":          {title:"5V RELAY MODULE",       specs:"250V AC/30V DC · 10A · Optocoupler isolated · Active LOW",             type:"relay",    pins:3},
  "l298n":          {title:"L298N MOTOR DRIVER",    specs:"Dual H-bridge · 2A/channel · 5-46V · PWM speed control",              type:"l298n",    pins:6},
  "soil moisture":  {title:"SOIL MOISTURE SENSOR",  specs:"Analog+Digital out · LM393 comparator · 3.3-5V · Adjustable threshold",type:"soil",     pins:3},
  "rfid":           {title:"RFID RC522",            specs:"13.56MHz · ISO14443A · SPI · 3.3V · Read/Write · 50mm range",          type:"rfid",     pins:7},
  "hc-05":          {title:"HC-05 BLUETOOTH",       specs:"Bluetooth 2.0 · UART · 5V · 10m range · Master+Slave · AT commands",   type:"bluetooth",pins:4},
  "hc-06":          {title:"HC-06 BLUETOOTH",       specs:"Bluetooth 2.0 · UART · 5V · 10m range · Slave only · AT commands",     type:"bluetooth",pins:4},
  "bluetooth":      {title:"HC-05 BLUETOOTH",       specs:"Bluetooth 2.0 · UART · 5V · 10m range · Master+Slave",                 type:"bluetooth",pins:4},
  "gps neo6m":      {title:"NEO-6M GPS MODULE",     specs:"GPS/GNSS · UART · 3.3-5V · 10Hz update · 2.5m accuracy · uBlox",      type:"gps",      pins:4},
  "gps":            {title:"NEO-6M GPS MODULE",     specs:"GPS/GNSS · UART · 3.3-5V · 10Hz update · 2.5m accuracy · uBlox",      type:"gps",      pins:4},
  "joystick":       {title:"ANALOG JOYSTICK",       specs:"2-axis analog + push button · 5V · 10kΩ potentiometers",               type:"joystick", pins:5},
  "buzzer":         {title:"ACTIVE BUZZER MODULE",  specs:"Active buzzer · 5V · 85dB · 2kHz · Direct drive",                     type:"buzzer",   pins:3},
  "encoder":        {title:"KY-040 ROTARY ENCODER", specs:"360° rotation · CLK+DT+SW · 5V · 20 pulses/rev · Push button",        type:"imu",      pins:5},
  "fingerprint":    {title:"R307 FINGERPRINT",      specs:"UART · 5V · 500dpi · Capacity: 256 · 360° readability",               type:"rfid",     pins:4},
};

function matchBoard(q){
  const n=q.trim().toLowerCase();
  for(const k of Object.keys(BOARDS)) if(n===k||n.includes(k)||k.includes(n)) return{key:k,...BOARDS[k]};
  return null;
}
function matchSensor(q){
  const n=q.trim().toLowerCase();
  for(const k of Object.keys(SENSORS)) if(n===k||n.includes(k)||k.includes(n)) return{key:k,...SENSORS[k]};
  return null;
}

// ─── THREE.JS MATERIALS ───────────────────────────────────────────────────────
function buildMats(){
  const M=c=>new THREE.MeshStandardMaterial(c);
  return{
    pcb:M({color:0x1a5e2a,roughness:0.35,metalness:0.15}),chip:M({color:0x18181f,roughness:0.3,metalness:0.8}),
    chipGray:M({color:0x2a2a3a,roughness:0.4,metalness:0.6}),gold:M({color:0xd4a017,roughness:0.15,metalness:1.0}),
    tin:M({color:0xaaaaaa,roughness:0.3,metalness:0.85}),usbMetal:M({color:0x888899,roughness:0.2,metalness:0.95}),
    usbBlack:M({color:0x111111,roughness:0.6,metalness:0.1}),neon:M({color:0x2d6a4f,emissive:0x2d6a4f,emissiveIntensity:0.8,roughness:0.3}),
    ledGreen:M({color:0x00ff44,emissive:0x00ff44,emissiveIntensity:2.0,roughness:0.2,transparent:true,opacity:0.9}),
    ledRed:M({color:0xff1111,emissive:0xff1111,emissiveIntensity:2.0,roughness:0.2,transparent:true,opacity:0.9}),
    ledBlue:M({color:0x2266ff,emissive:0x2266ff,emissiveIntensity:1.8,roughness:0.2,transparent:true,opacity:0.9}),
    ledOrange:M({color:0xff8800,emissive:0xff8800,emissiveIntensity:2.0,roughness:0.2,transparent:true,opacity:0.9}),
    connBlack:M({color:0x1c1c1c,roughness:0.7,metalness:0.1}),dark:M({color:0x111122,roughness:0.4,metalness:0.6}),
    sensorCyl:M({color:0xaaaaaa,roughness:0.2,metalness:0.8}),wireRed:M({color:0xcc0000,roughness:0.7}),
    wireBlack:M({color:0x222222,roughness:0.7}),wireYellow:M({color:0xddcc00,roughness:0.7}),
    regulator:M({color:0x222222,roughness:0.5,metalness:0.5}),crystalSil:M({color:0xddddcc,roughness:0.1,metalness:0.9}),
    capBlue:M({color:0x0033aa,roughness:0.4,metalness:0.1}),resBody:M({color:0x8B4513,roughness:0.6}),
    connBlue:M({color:0x0033aa,roughness:0.4}),screenBlue:M({color:0x000088,emissive:0x0044ff,emissiveIntensity:1.2,roughness:0.1}),
    rfidBlue:M({color:0x003366,roughness:0.35,metalness:0.15}),pirPCB:M({color:0x2a5a1a,roughness:0.4,metalness:0.1}),
    servoBlue:M({color:0x2244bb,roughness:0.4,metalness:0.2}),servoGray:M({color:0x888888,roughness:0.4,metalness:0.3}),
    relayBlue:M({color:0x1133aa,roughness:0.4,metalness:0.1}),coil:M({color:0x553300,roughness:0.6,metalness:0.2}),
    trace:M({color:0xd4a017,roughness:0.1,metalness:1.0,transparent:true,opacity:0.85}),
    soil:M({color:0x2a5a1a,roughness:0.35,metalness:0.1}),
  };
}

function adder(g){
  return(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{
    const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;g.add(m);
  };
}
function pinHeaders(add,m,count,x,topY,startZ,step=0.28){
  for(let i=0;i<count;i++){
    const pz=startZ+i*step;
    add(new THREE.BoxGeometry(0.2,0.28,0.2),m.connBlack,x,topY+0.14,pz);
    add(new THREE.BoxGeometry(0.08,0.5,0.08),m.gold,x,topY+0.08,pz);
  }
}

function buildBoard(board,m){
  const g=new THREE.Group();const add=adder(g);
  const[bwS,bH,blS]=board.size;const top=bH/2;
  const pcbM=new THREE.MeshStandardMaterial({color:board.color,roughness:0.35,metalness:0.15});
  add(new THREE.BoxGeometry(bwS,bH,blS),pcbM,0,0,0);
  [[bwS/2-0.4,blS/2-0.4],[bwS/2-0.4,-blS/2+0.4],[-bwS/2+0.4,blS/2-0.4],[-bwS/2+0.4,-blS/2+0.4]].forEach(([hx,hz])=>{
    add(new THREE.CylinderGeometry(0.12,0.12,bH+0.01,12),new THREE.MeshStandardMaterial({color:0x888888,roughness:0.3,metalness:0.8}),hx,0,hz);
  });
  if(board.shape==='rpi'){
    [-1.5,-2.3].forEach(z=>add(new THREE.BoxGeometry(0.7,0.3,0.45),m.usbMetal,-bwS/2-0.05,top+0.15,blS/2+z));
    [blS/2-0.9,blS/2-2.0].forEach(z=>add(new THREE.BoxGeometry(0.7,0.5,1.1),new THREE.MeshStandardMaterial({color:0x0044ff,roughness:0.3,metalness:0.7}),bwS/2+0.05,top+0.25,z));
    for(let r=0;r<2;r++)for(let c=0;c<20;c++){
      add(new THREE.BoxGeometry(0.18,0.28,0.18),m.connBlack,-bwS/2+0.4+r*0.28,top+0.14,-blS/2+0.5+c*0.28);
      add(new THREE.BoxGeometry(0.07,0.5,0.07),m.gold,-bwS/2+0.4+r*0.28,top+0.06,-blS/2+0.5+c*0.28);
    }
    add(new THREE.BoxGeometry(2.4,0.4,2.4),m.chip,0.3,top+0.25,0.5);
    g.rotation.set(-0.25,0,0);return g;
  }
  const cw=board.shape==='nano'?1.0:1.4;
  add(new THREE.BoxGeometry(cw,0.18,cw),m.chip,0,top+0.09,0.6);
  add(new THREE.CylinderGeometry(0.1,0.1,0.45,12),m.crystalSil,0.9,top+0.22,0.6);
  if(board.shape==='uno'||board.shape==='mega'){
    add(new THREE.BoxGeometry(0.7,0.35,1.1),m.usbMetal,-bwS/2-0.05,top+0.17,blS/2-0.8);
    add(new THREE.CylinderGeometry(0.32,0.32,0.7,16),m.usbBlack,bwS/2-0.5,top+0.2,blS/2-0.5,Math.PI/2,0,0);
    add(new THREE.BoxGeometry(0.3,0.55,0.22),m.regulator,-bwS/2+0.6,top+0.27,blS/2-1.5);
  } else {
    add(new THREE.BoxGeometry(0.5,0.28,0.7),m.usbMetal,0,top+0.14,-blS/2-0.05);
  }
  if(board.shape==='uno'){
    pinHeaders(add,m,6,-bwS/2+0.35,top,blS/2-0.9,-0.26);pinHeaders(add,m,8,-bwS/2+0.35,top,-blS/2+0.4,0.26);
    pinHeaders(add,m,10,bwS/2-0.35,top,blS/2-0.9,-0.26);pinHeaders(add,m,8,bwS/2-0.35,top,-blS/2+0.4,0.26);
  } else if(board.shape==='mega'){
    for(let r=0;r<4;r++)pinHeaders(add,m,18,(-bwS/2+0.35)+r*0.3,top,blS/2-0.5,-0.28);
  } else {
    pinHeaders(add,m,15,-bwS/2+0.2,top,-blS/2+0.4,0.28);pinHeaders(add,m,15,bwS/2-0.2,top,-blS/2+0.4,0.28);
  }
  [[0.4,top+0.25,-0.8],[0.8,top+0.25,-0.8]].forEach(([cx,cy,cz])=>add(new THREE.CylinderGeometry(0.1,0.1,0.3,12),m.capBlue,cx,cy,cz));
  [[m.ledGreen,bwS/2-0.35],[m.ledOrange,bwS/2-0.75]].forEach(([lm,lx])=>add(new THREE.SphereGeometry(0.08,8,8),lm,lx,top+0.08,-blS/2+0.45));
  if(board.shape==='esp') add(new THREE.BoxGeometry(0.08,0.08,blS*0.28),m.sensorCyl,bwS/2-0.15,top+0.04,blS/2*0.55);
  g.rotation.set(-0.25,0,0);
  return g;
}

function buildSensor(sensor,m){
  const g=new THREE.Group();const add=adder(g);
  switch(sensor.type){
    case"hcsr04":
      add(new THREE.BoxGeometry(4.5,0.15,2.0),new THREE.MeshStandardMaterial({color:0x1a3a6e,roughness:0.35,metalness:0.15}),0,0,0);
      [-1.2,1.2].forEach(x=>{add(new THREE.CylinderGeometry(0.52,0.52,0.9,24),m.sensorCyl,x,0.5,0);add(new THREE.CylinderGeometry(0.38,0.38,0.92,24),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.8}),x,0.5,0);});
      add(new THREE.BoxGeometry(0.9,0.12,0.7),m.chip,0.4,0.14,0.2);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.12,0.5,0.12),m.tin,-0.6+i*0.4,0.25,-0.85);
      break;
    case"pir":
      add(new THREE.BoxGeometry(3.2,0.15,3.2),m.pirPCB,0,0,0);
      add(new THREE.SphereGeometry(0.9,24,24,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.1,transparent:true,opacity:0.7}),0,0.15,0);
      [-0.9,0.9].forEach(x=>add(new THREE.CylinderGeometry(0.18,0.18,0.25,12),new THREE.MeshStandardMaterial({color:0x1a88ff}),x,0.2,1.1));
      for(let i=0;i<3;i++)add(new THREE.BoxGeometry(0.1,0.55,0.1),m.tin,-0.2+i*0.2,-0.28,1.5);
      break;
    case"dht22":case"dht11":
      add(new THREE.BoxGeometry(1.8,1.5,1.0),new THREE.MeshStandardMaterial({color:sensor.type==="dht11"?0x1a6a2a:0x1a1a1a,roughness:0.5}),0,0.75,0);
      for(let r=0;r<4;r++)for(let c=0;c<3;c++)add(new THREE.BoxGeometry(0.25,0.22,0.05),new THREE.MeshStandardMaterial({color:0x444444,roughness:0.8}),-0.35+c*0.35,0.2+r*0.32,0.53);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.08,0.6,0.08),m.tin,-0.4+i*0.28,-0.3,0);
      break;
    case"oled":
      add(new THREE.BoxGeometry(3.5,0.12,3.5),new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:0.4}),0,0,0);
      add(new THREE.BoxGeometry(2.8,0.05,2.1),m.screenBlue,0,0.09,0.2);
      for(let r=0;r<6;r++)add(new THREE.BoxGeometry(2.4,0.03,0.08),new THREE.MeshStandardMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.8,roughness:0.1}),0,0.12,0.7-r*0.28);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.1,0.5,0.1),m.tin,-0.45+i*0.3,-0.25,-1.65);
      break;
    case"lcd":
      add(new THREE.BoxGeometry(7.2,0.18,5.0),new THREE.MeshStandardMaterial({color:0x003366,roughness:0.4}),0,0,0);
      add(new THREE.BoxGeometry(6.4,0.06,3.2),new THREE.MeshStandardMaterial({color:0x0044aa,emissive:0x002266,emissiveIntensity:0.8,roughness:0.1}),0,0.12,0.2);
      for(let r=0;r<2;r++)for(let c=0;c<16;c++)add(new THREE.BoxGeometry(0.28,0.04,0.5),new THREE.MeshStandardMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.5,roughness:0.1}),-(16/2)*0.36+c*0.36+0.18,0.15,0.5-r*1.1);
      for(let i=0;i<16;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-(16/2)*0.25+i*0.25,-0.2,-2.3);
      break;
    case"servo":
      add(new THREE.BoxGeometry(2.3,2.2,1.15),m.servoBlue,0,1.0,0);
      [-1.3,1.3].forEach(x=>add(new THREE.BoxGeometry(0.25,0.35,1.3),m.servoGray,x,1.9,0));
      add(new THREE.CylinderGeometry(0.22,0.22,0.3,16),m.sensorCyl,0,2.2,0.3);
      add(new THREE.BoxGeometry(1.4,0.12,0.22),m.sensorCyl,0,2.38,0.3);
      [m.wireRed,m.wireBlack,m.wireYellow].forEach((wm,i)=>add(new THREE.CylinderGeometry(0.07,0.07,1.2,6),wm,-0.2+i*0.2,-0.2,0));
      break;
    case"relay":
      add(new THREE.BoxGeometry(4.0,0.15,5.0),m.relayBlue,0,0,0);
      add(new THREE.BoxGeometry(1.8,1.2,2.0),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}),0,0.68,0.3);
      add(new THREE.BoxGeometry(1.4,0.1,1.6),m.coil,0,1.33,0.3);
      add(new THREE.BoxGeometry(0.12,0.1,0.16),m.ledGreen,1.5,0.13,1.5);
      for(let i=0;i<3;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.2+i*0.2,-0.2,2.4);
      break;
    case"mq":
      add(new THREE.BoxGeometry(3.2,0.15,3.2),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.4}),0,0,0);
      add(new THREE.CylinderGeometry(0.7,0.7,0.9,24),m.sensorCyl,0,0.53,0);
      add(new THREE.CylinderGeometry(0.65,0.65,0.85,24,1,true),new THREE.MeshStandardMaterial({color:0x888888,roughness:0.3,metalness:0.7,wireframe:true}),0,0.53,0);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new THREE.BoxGeometry(0.08,0.55,0.08),m.tin,Math.cos(a)*0.65,0.0,Math.sin(a)*0.65);}
      break;
    case"rfid":
      add(new THREE.BoxGeometry(4.8,0.12,6.0),m.rfidBlue,0,0,0);
      add(new THREE.TorusGeometry(1.6,0.06,6,4),new THREE.MeshStandardMaterial({color:0xd4a017,roughness:0.1,metalness:1.0}),0,0.1,0,0,0,Math.PI/4);
      add(new THREE.TorusGeometry(1.2,0.05,6,4),m.trace,0,0.1,0,0,0,Math.PI/4);
      add(new THREE.BoxGeometry(1.2,0.2,1.2),m.chip,0.5,0.16,-0.5);
      for(let i=0;i<7;i++){add(new THREE.BoxGeometry(0.18,0.26,0.18),m.connBlack,-2.1,0.13,-2.0+i*0.5);add(new THREE.BoxGeometry(0.07,0.45,0.07),m.gold,-2.1,0.06,-2.0+i*0.5);}
      break;
    case"l298n":
      add(new THREE.BoxGeometry(4.5,0.15,4.5),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.4}),0,0,0);
      add(new THREE.BoxGeometry(1.5,1.0,1.5),m.chip,0,0.58,0);
      add(new THREE.BoxGeometry(2.0,0.8,0.25),new THREE.MeshStandardMaterial({color:0x888888,roughness:0.3,metalness:0.8}),0,0.7,-0.9);
      [-1.5,-0.5,0.5,1.5].forEach(x=>{add(new THREE.CylinderGeometry(0.2,0.2,0.45,12),m.sensorCyl,x,0.28,-1.8);add(new THREE.CylinderGeometry(0.2,0.2,0.45,12),m.sensorCyl,x,0.28,1.8);});
      break;
    case"neopixel":
      const rc=[0xff0000,0xff6600,0xffff00,0x00ff00,0x00ffcc,0x0088ff,0xff00ff,0xff0066,0xff0000,0xff6600,0xffff00,0x00ff00];
      for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;add(new THREE.BoxGeometry(0.35,0.1,0.35),new THREE.MeshStandardMaterial({color:rc[i],emissive:rc[i],emissiveIntensity:1.5,roughness:0.2,transparent:true,opacity:0.9}),Math.cos(a)*1.8,0.1,Math.sin(a)*1.8);}
      add(new THREE.TorusGeometry(1.8,0.4,8,48),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}),0,0,0,Math.PI/2,0,0);
      break;
    case"ldr":
      add(new THREE.CylinderGeometry(0.5,0.5,0.12,20),new THREE.MeshStandardMaterial({color:0xdddddd,roughness:0.3}),0,0.06,0);
      add(new THREE.CylinderGeometry(0.35,0.35,0.08,20,1,true),new THREE.MeshStandardMaterial({color:0x884400,roughness:0.2,metalness:0.5}),0,0.1,0);
      add(new THREE.BoxGeometry(0.06,0.9,0.06),m.tin,-0.15,-0.45,0);add(new THREE.BoxGeometry(0.06,0.9,0.06),m.tin,0.15,-0.45,0);
      add(new THREE.BoxGeometry(1.6,0.1,1.6),new THREE.MeshStandardMaterial({color:0x1a5e2a,roughness:0.4}),0,-0.9,0);
      break;
    case"bluetooth":
      add(new THREE.BoxGeometry(3.0,0.12,4.5),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.35}),0,0,0);
      add(new THREE.BoxGeometry(1.5,0.2,2.0),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4,metalness:0.5}),0,0.16,0.3);
      add(new THREE.BoxGeometry(0.08,1.5,0.08),m.sensorCyl,1.2,0.87,-1.8);
      add(new THREE.BoxGeometry(0.12,0.1,0.16),m.ledBlue,0.8,0.13,-1.8);
      for(let i=0;i<4;i++){add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.3+i*0.2,-0.2,2.1);}
      break;
    case"gps":
      add(new THREE.BoxGeometry(4.0,0.15,3.5),new THREE.MeshStandardMaterial({color:0x1a3a6e,roughness:0.35}),0,0,0);
      add(new THREE.BoxGeometry(1.5,0.4,1.5),new THREE.MeshStandardMaterial({color:0xcccccc,roughness:0.3,metalness:0.4}),0,0.28,0.3);
      add(new THREE.BoxGeometry(1.3,0.1,1.3),m.trace,0,0.5,0.3);
      add(new THREE.BoxGeometry(0.9,0.18,0.9),m.chip,-0.8,0.17,-0.8);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.3+i*0.2,-0.22,1.65);
      break;
    case"joystick":
      add(new THREE.BoxGeometry(3.5,0.15,3.5),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.35}),0,0,0);
      add(new THREE.CylinderGeometry(0.7,0.8,0.6,20),new THREE.MeshStandardMaterial({color:0x444444,roughness:0.4}),0,0.38,0);
      add(new THREE.CylinderGeometry(0.18,0.22,2.2,16),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.5}),0,1.68,0);
      add(new THREE.SphereGeometry(0.35,16,16),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.4}),0,2.78,0);
      for(let i=0;i<5;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.4+i*0.2,-0.22,-1.65);
      break;
    case"buzzer":
      add(new THREE.BoxGeometry(2.2,0.12,2.2),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.4}),0,0,0);
      add(new THREE.CylinderGeometry(0.7,0.7,0.5,24),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.3}),0,0.37,0.1);
      add(new THREE.CylinderGeometry(0.25,0.25,0.06,16),new THREE.MeshStandardMaterial({color:0x333333,roughness:0.2}),0,0.65,0.1);
      for(let i=0;i<3;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.1+i*0.1,-0.21,-0.8);
      break;
    case"ds18b20":
      add(new THREE.CylinderGeometry(0.22,0.22,1.2,16,1,false,0,Math.PI),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}),0,0.6,0);
      add(new THREE.BoxGeometry(0.44,1.2,0.28),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.5}),0,0.6,0.11);
      [m.wireBlack,m.wireRed,m.wireYellow].forEach((wm,i)=>add(new THREE.CylinderGeometry(0.06,0.06,2.5,8),wm,-0.1+i*0.1,2.45,0));
      break;
    case"bmp280":
      add(new THREE.BoxGeometry(1.8,0.12,1.8),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.35}),0,0,0);
      add(new THREE.BoxGeometry(0.7,0.12,0.7),new THREE.MeshStandardMaterial({color:0x555555,roughness:0.2,metalness:0.8}),0,0.12,0);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.1,0.42,0.1),m.tin,-0.45+i*0.3,-0.21,-0.85);
      break;
    case"imu":
      add(new THREE.BoxGeometry(2.0,0.12,1.5),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:0.35}),0,0,0);
      add(new THREE.BoxGeometry(0.8,0.14,0.8),new THREE.MeshStandardMaterial({color:0x444444,roughness:0.2,metalness:0.8}),0,0.13,0);
      for(let i=0;i<6;i++)add(new THREE.BoxGeometry(0.1,0.45,0.1),m.tin,-0.75+i*0.3,-0.22,-0.7);
      break;
    case"soil":
      add(new THREE.BoxGeometry(2.0,0.12,3.5),new THREE.MeshStandardMaterial({color:0x2a5a1a,roughness:0.35}),0,0,0);
      [-0.4,0.4].forEach(x=>add(new THREE.BoxGeometry(0.18,0.08,3.0),new THREE.MeshStandardMaterial({color:0xb87333,roughness:0.2,metalness:0.9}),x,0.1,0.5));
      add(new THREE.BoxGeometry(0.65,0.18,0.65),m.chip,0,0.15,-0.8);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.45+i*0.3,-0.2,-1.65);
      break;
    case"ir":
      add(new THREE.BoxGeometry(3.0,0.12,1.4),new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.4}),0,0,0);
      add(new THREE.CylinderGeometry(0.16,0.16,0.4,12),new THREE.MeshStandardMaterial({color:0x111111,roughness:0.2,transparent:true,opacity:0.85}),-0.7,0.26,0);
      add(new THREE.CylinderGeometry(0.16,0.16,0.4,12),new THREE.MeshStandardMaterial({color:0x2244bb,roughness:0.1,transparent:true,opacity:0.7,emissive:0x0011ff,emissiveIntensity:0.5}),0.7,0.26,0);
      add(new THREE.BoxGeometry(0.12,0.1,0.16),m.ledGreen,1.1,0.11,0.4);
      for(let i=0;i<3;i++)add(new THREE.BoxGeometry(0.1,0.45,0.1),m.tin,-0.2+i*0.2,-0.22,-0.65);
      break;
    default:
      add(new THREE.BoxGeometry(2.0,0.12,1.6),new THREE.MeshStandardMaterial({color:0x1a2a3a,roughness:0.35}),0,0,0);
      add(new THREE.BoxGeometry(0.75,0.16,0.75),m.chip,0,0.14,0.1);
      add(new THREE.SphereGeometry(0.08,8,8),m.ledGreen,0.7,0.12,0.5);
      for(let i=0;i<4;i++)add(new THREE.BoxGeometry(0.1,0.4,0.1),m.tin,-0.3+i*0.2,-0.21,-0.7);
  }
  return g;
}

function buildRobot(m){
  const g=new THREE.Group();const add=adder(g);
  add(new THREE.BoxGeometry(4,0.3,3),m.pcb,0,-1.5,0);
  add(new THREE.BoxGeometry(2,2,1.5),m.dark,0,0.2,0);
  add(new THREE.BoxGeometry(2.4,0.15,1.9),m.chip,0,1.28,0);
  add(new THREE.BoxGeometry(1.7,1.7,0.08),new THREE.MeshStandardMaterial({color:0x1a2a3a,roughness:0.2}),0,0.2,0.79);
  [-0.45,0.45].forEach(x=>add(new THREE.BoxGeometry(0.38,0.38,0.22),new THREE.MeshStandardMaterial({color:0x001122,roughness:0.1,emissive:0x0033ff,emissiveIntensity:0.6}),x,0.35,0.8));
  add(new THREE.BoxGeometry(0.5,0.08,0.08),m.ledRed,0,0.05,0.8);
  [-0.8,0.8].forEach(x=>{add(new THREE.BoxGeometry(0.25,1.2,0.25),m.dark,x,0.2,0);add(new THREE.BoxGeometry(0.2,0.2,0.8),m.chip,x,-0.45,0.3);});
  add(new THREE.CylinderGeometry(0.06,0.06,0.5,8),m.neon,0,1.7,0);
  add(new THREE.SphereGeometry(0.12,12,12),m.neon,0,1.97,0);
  return g;
}

// ─── 3D SCENE ─────────────────────────────────────────────────────────────────
function initScene(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(45,1,0.1,100);
  camera.position.set(0,3,12);camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff,0.5));
  const keyL=new THREE.DirectionalLight(0xffffff,1.5);keyL.position.set(4,8,6);keyL.castShadow=true;scene.add(keyL);
  const fillL=new THREE.DirectionalLight(0xd0e8ff,0.6);fillL.position.set(-4,2,-3);scene.add(fillL);
  const rimL=new THREE.PointLight(0xffcc88,1.0,20);rimL.position.set(-3,4,-3);scene.add(rimL);
  const grid=new THREE.GridHelper(20,20,0xdddddd,0xeeeeee);grid.position.set(0,-2.5,0);scene.add(grid);
  const mats=buildMats();
  let current=buildRobot(mats);scene.add(current);
  let autoRot=true,isDrag=false,prevX=0,prevY=0,rotX=0,rotY=0,t=0;
  const onDown=e=>{isDrag=true;prevX=e.clientX??e.touches?.[0]?.clientX??0;prevY=e.clientY??e.touches?.[0]?.clientY??0;autoRot=false;};
  const onUp=()=>isDrag=false;
  const onMove=e=>{
    if(!isDrag)return;
    const cx=e.clientX??e.touches?.[0]?.clientX??0,cy=e.clientY??e.touches?.[0]?.clientY??0;
    rotY+=(cx-prevX)*0.01;rotX+=(cy-prevY)*0.01;
    rotX=Math.max(-Math.PI/3,Math.min(Math.PI/3,rotX));
    if(current){current.rotation.y=rotY;current.rotation.x=rotX;}
    prevX=cx;prevY=cy;
  };
  canvas.addEventListener('mousedown',onDown);canvas.addEventListener('touchstart',onDown,{passive:true});
  window.addEventListener('mouseup',onUp);window.addEventListener('touchend',onUp);
  window.addEventListener('mousemove',onMove);window.addEventListener('touchmove',onMove,{passive:true});
  const resize=()=>{const p=canvas.parentElement;if(!p)return;const w=p.clientWidth,h=p.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  setTimeout(resize,0);window.addEventListener('resize',resize);
  let raf;
  const animate=()=>{raf=requestAnimationFrame(animate);t+=0.016;if(current&&autoRot)current.rotation.y=t*0.35;renderer.render(scene,camera);};
  animate();
  return{
    mats,
    load:(obj)=>{scene.remove(current);current.traverse(o=>{if(o.geometry)o.geometry.dispose();});current=obj;scene.add(obj);autoRot=true;rotX=0;rotY=0;},
    resize,
    destroy:()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('mouseup',onUp);window.removeEventListener('touchend',onUp);window.removeEventListener('mousemove',onMove);renderer.dispose();}
  };
}

// ─── AI PROMPTS ───────────────────────────────────────────────────────────────
const CHAT_SYSTEM=`You are BOOT-UP, an expert AI engineering agent for Arduino, robotics, electronics, and embedded systems. Be concise and technical. Use **bold** for key terms and \`code\` for snippets.`;
const PROJECT_SYSTEM=`You are a hardware engineering assistant. Output ONLY a valid JSON object. No markdown fences, no explanation, no text before or after. CRITICAL JSON rules: use double quotes only, escape backslashes as \\\\, escape newlines in code as \\n, escape double quotes inside strings as \\". Keep code fields short (under 15 lines). Max 5 steps. Format exactly: {"title":"string","difficulty":"Beginner","time":"string","cost":"string","components":[{"name":"string","qty":1,"purpose":"string"}],"wiring":[{"from":"string","to":"string","color":"#rrggbb"}],"steps":[{"n":1,"title":"string","desc":"string","code":"string"}],"visual":{"boards":["arduino uno"],"sensors":["hc-sr04"]},"tips":["string"]}`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function CodeBlock({code}){
  const[copied,setCopied]=useState(false);
  if(!code||!code.trim())return null;
  return(
    <div style={{position:"relative",marginTop:12}}>
      <pre style={{background:"#0d0d14",border:"1px solid #1e1e2e",borderLeft:"3px solid #00e5ff",padding:"12px 14px",fontFamily:"'Courier New',monospace",fontSize:11,color:"#8888aa",overflowX:"auto",borderRadius:"0 6px 6px 0",margin:0,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{code}</pre>
      <button onClick={()=>{navigator.clipboard?.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
        style={{position:"absolute",top:6,right:6,background:"#111118",border:"1px solid #2a2a3f",color:"#44445a",fontFamily:"'Courier New',monospace",fontSize:9,padding:"3px 8px",cursor:"pointer",borderRadius:4,letterSpacing:1,transition:"all 0.2s"}}>
        {copied?"✓":"COPY"}
      </button>
    </div>
  );
}

function MsgText({text}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;
    ref.current.innerHTML=text.split('\n').map(line=>
      line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#00e5ff;font-weight:700">$1</strong>')
          .replace(/`(.*?)`/g,'<code style="background:#1e1e2e;padding:1px 6px;font-family:monospace;font-size:11px;color:#00e5ff;border-radius:4px;border:1px solid #2a2a3f">$1</code>')
    ).join('<br/>');
  },[text]);
  return <div ref={ref} style={{lineHeight:1.7,fontSize:13}}/>;
}

const DIFF={Beginner:{c:"#00e5ff",bg:"rgba(0,229,255,0.08)"},Intermediate:{c:"#f59e0b",bg:"rgba(245,158,11,0.08)"},Advanced:{c:"#ef4444",bg:"rgba(239,68,68,0.08)"}};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BootUp(){
  const[tab,setTab]=useState("sim");
  const[simInput,setSimInput]=useState("");
  const[boardInfo,setBoardInfo]=useState({title:"BOOT-UP",specs:"Type any board or sensor to load its 3D model"});
  const[messages,setMessages]=useState([{role:"agent",text:"👋 Welcome to **BOOT-UP**!\n\n**SIM tab** → type a board/sensor to see its 3D model\n**PROJECT tab** → describe a project for a full build guide\n\nBoards: Arduino Uno · Mega · Nano · ESP32 · RPi 5 · Pico · STM32 · Teensy\nSensors: HC-SR04 · DHT22 · PIR · MPU6050 · OLED · LCD · Servo · NeoPixel · Relay · RFID · GPS"}]);
  const[chatInput,setChatInput]=useState("");
  const[chatLoading,setChatLoading]=useState(false);
  const historyRef=useRef([]);
  const chatRef=useRef(null);

  const[projInput,setProjInput]=useState("");
  const[projLoading,setProjLoading]=useState(false);
  const[project,setProject]=useState(null);
  const[activeStep,setActiveStep]=useState(0);
  const[projError,setProjError]=useState("");
  const[imgUrl,setImgUrl]=useState(null);
  const[imgLoading,setImgLoading]=useState(false);
  const[showImg,setShowImg]=useState(false);

  // NEW TAB STATE
  const[libSearch,setLibSearch]=useState("");
  const[libFilter,setLibFilter]=useState("all");
  const[compareA,setCompareA]=useState("");
  const[compareB,setCompareB]=useState("");
  const[cartItems,setCartItems]=useState([]);
  const[ideaParts,setIdeaParts]=useState([]);
  const[ideaLoading,setIdeaLoading]=useState(false);
  const[ideas,setIdeas]=useState([]);

  // ── PLATFORM STATE ──
  const[mode,setMode]=useState("chat"); // chat | code | image | robotics | voice
  const[chatMsgs,setChatMsgs]=useState([{role:"ai",text:"Hey! I'm NEXUS, your AI platform. I can chat about anything, analyze images, write and explain code, or switch into full Robotics mode for hardware projects. What do you need?"}]);
  const[chatIn,setChatIn]=useState("");
  const[chatBusy,setChatBusy]=useState(false);
  const[chatHistory,setChatHistory]=useState([]);
  const[uploadedImg,setUploadedImg]=useState(null);
  const[uploadedFile,setUploadedFile]=useState(null);
  const[codeInput,setCodeInput]=useState("// Start typing your code here...\n// Ask AI to explain, fix, or improve it\n");
  const[codeOutput,setCodeOutput]=useState("");
  const[codeLang,setCodeLang]=useState("javascript");
  const[codeBusy,setCodeBusy]=useState(false);
  const[imgAnalysis,setImgAnalysis]=useState("");
  const[imgBusy,setImgBusy]=useState(false);
  const[isListening,setIsListening]=useState(false);
  const[transcript,setTranscript]=useState("");
  const recognitionRef=useRef(null);
  const fileInputRef=useRef(null);
  const imgInputRef=useRef(null);
  const chatEndRef=useRef(null);

  const simCanvasRef=useRef(null);
  const simSceneRef=useRef(null);
  const projCanvasRef=useRef(null);
  const projSceneRef=useRef(null);

  useEffect(()=>{
    if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;
  },[messages,chatLoading]);

  // Init SIM scene
  useEffect(()=>{
    if(!simCanvasRef.current)return;
    const s=initScene(simCanvasRef.current);
    simSceneRef.current=s;
    return()=>s.destroy();
  },[]);

  // Init PROJECT scene — triggered once project tab first mounts or canvas is ready
  const projCanvasInitialized=useRef(false);
  useEffect(()=>{
    if(tab!=="project"||projCanvasInitialized.current||!projCanvasRef.current)return;
    projCanvasInitialized.current=true;
    const s=initScene(projCanvasRef.current);
    projSceneRef.current=s;
    // Force resize after tab becomes visible
    requestAnimationFrame(()=>s.resize());
    return()=>{s.destroy();projCanvasInitialized.current=false;};
  },[tab]);

  // When project data arrives, load first component
  useEffect(()=>{
    if(!project||!projSceneRef.current)return;
    const all=[...(project.visual?.boards||[]),...(project.visual?.sensors||[])];
    const name=all[0];if(!name)return;
    const b=matchBoard(name);const se=matchSensor(name);
    if(b)projSceneRef.current.load(buildBoard(b,projSceneRef.current.mats));
    else if(se)projSceneRef.current.load(buildSensor(se,projSceneRef.current.mats));
  },[project]);

  // ── PLATFORM API CALL ──
  const apiCall=async(messages,maxTokens=1500,system="You are NEXUS, a powerful AI assistant. Be helpful, accurate, and concise.")=>{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTokens,system,messages})});
    const data=await res.json();
    if(data.error)throw new Error(data.error.message);
    return data.content?.map(b=>b.text||"").join("")||"";
  };

  // ── GENERAL CHAT ──
  const sendGenChat=useCallback(async(textOverride)=>{
    const text=(textOverride||chatIn).trim();
    if(!text||chatBusy)return;
    setChatIn("");
    const userMsg={role:"user",text};
    const newHistory=[...chatHistory,{role:"user",content:text}];
    setChatMsgs(p=>[...p,userMsg]);
    setChatHistory(newHistory);
    setChatBusy(true);
    try{
      let messages=newHistory;
      // If image is attached, include it
      if(uploadedImg){
        const lastMsg=messages[messages.length-1];
        messages=[...messages.slice(0,-1),{role:"user",content:[
          {type:"image",source:{type:"base64",media_type:"image/jpeg",data:uploadedImg.split(",")[1]}},
          {type:"text",text:lastMsg.content}
        ]}];
      }
      const reply=await apiCall(messages,2000,"You are NEXUS, a powerful AI assistant. Be helpful, concise, and smart. Use **bold** for key terms and \`code\` for snippets. Support all topics: general knowledge, coding, science, math, creative writing, analysis, and more.");
      setChatHistory(p=>[...p,{role:"assistant",content:reply}]);
      setChatMsgs(p=>[...p,{role:"ai",text:reply}]);
      setUploadedImg(null);
    }catch(e){setChatMsgs(p=>[...p,{role:"ai",text:"Error: "+e.message}]);}
    finally{setChatBusy(false);}
  },[chatIn,chatBusy,chatHistory,uploadedImg]);

  // ── CODE AI ──
  const askCodeAI=useCallback(async(action)=>{
    if(!codeInput.trim()||codeBusy)return;
    setCodeBusy(true);setCodeOutput("");
    try{
      const prompts={
        explain:"Explain this code clearly, line by line where needed. Use **bold** for key concepts and \`code\` for terms.",
        fix:"Find and fix all bugs in this code. Show the fixed code and explain what was wrong.",
        improve:"Improve this code for performance, readability, and best practices. Show improved version with comments.",
        complete:"Complete this code. Fill in any missing parts, add error handling, and make it production-ready.",
        convert:"Convert this code to "+codeLang+". Keep the same logic but use idiomatic "+codeLang+".",
        test:"Write comprehensive unit tests for this code."
      };
      const reply=await apiCall([{role:"user",content:"Language: "+codeLang+"\n\nCode:\n```\n"+codeInput+"\n```\n\nTask: "+prompts[action]}],3000,
        "You are an expert software engineer and code assistant. Format code blocks with \`\`\` fences. Be precise and helpful.");
      setCodeOutput(reply);
    }catch(e){setCodeOutput("Error: "+e.message);}
    finally{setCodeBusy(false);}
  },[codeInput,codeLang,codeBusy]);

  // ── IMAGE ANALYSIS ──
  const analyzeImage=useCallback(async()=>{
    if(!uploadedImg||imgBusy)return;
    setImgBusy(true);setImgAnalysis("");
    try{
      const reply=await apiCall([{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:"image/jpeg",data:uploadedImg.split(",")[1]}},
        {type:"text",text:"Analyze this image in detail. Describe what you see, identify any text, objects, patterns, or notable elements. If it shows code or technical content, explain it. If it shows a circuit or hardware, identify the components."}
      ]}],2000,"You are an expert image analyst with knowledge of technology, science, art, and engineering.");
      setImgAnalysis(reply);
    }catch(e){setImgAnalysis("Error: "+e.message);}
    finally{setImgBusy(false);}
  },[uploadedImg,imgBusy]);

  // ── VOICE INPUT ──
  const toggleVoice=useCallback(()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){
      alert("Voice input not supported in this browser. Try Chrome.");return;
    }
    if(isListening){
      recognitionRef.current?.stop();setIsListening(false);return;
    }
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();r.continuous=true;r.interimResults=true;r.lang="en-US";
    r.onresult=e=>{
      const t=Array.from(e.results).map(r=>r[0].transcript).join("");
      setTranscript(t);setChatIn(t);
    };
    r.onend=()=>setIsListening(false);
    r.start();recognitionRef.current=r;setIsListening(true);
  },[isListening]);

  // ── FILE UPLOAD ──
  const handleFileUpload=useCallback((e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const text=ev.target.result;
      setCodeInput(text);setMode("code");
      const ext=file.name.split(".").pop().toLowerCase();
      const langMap={js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",cpp:"cpp",c:"cpp",java:"java",rs:"rust",go:"go",html:"html",css:"css",json:"json",md:"markdown"};
      setCodeLang(langMap[ext]||"javascript");
    };
    reader.readAsText(file);
  },[]);

  const handleImgUpload=useCallback((e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{setUploadedImg(ev.target.result);};
    reader.readAsDataURL(file);
  },[]);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"});},[chatMsgs,chatBusy]);

  const loadObject=useCallback(()=>{
    const q=simInput.trim();if(!q)return;
    const board=matchBoard(q);const sensor=matchSensor(q);
    if(board){
      simSceneRef.current.load(buildBoard(board,simSceneRef.current.mats));
      setBoardInfo({title:board.title,specs:board.specs});
      setMessages(p=>[...p,{role:"agent",text:`Loaded **${board.title}**\n\n${board.specs}\n\nDrag to rotate!`}]);
    }else if(sensor){
      simSceneRef.current.load(buildSensor(sensor,simSceneRef.current.mats));
      setBoardInfo({title:sensor.title,specs:sensor.specs});
      setMessages(p=>[...p,{role:"agent",text:`Loaded **${sensor.title}**\n\n${sensor.specs}\n\nPins: ${sensor.pins} · Drag to inspect!`}]);
    }else{
      setMessages(p=>[...p,{role:"agent",text:`Not found: "${q}"\n\nTry: Arduino Uno, ESP32, RPi 5, DHT22, MPU6050, OLED, Relay, RFID, Servo, GPS...`}]);
    }
  },[simInput]);

  const sendChat=useCallback(async()=>{
    const text=chatInput.trim();if(!text||chatLoading)return;
    setChatInput("");
    setMessages(p=>[...p,{role:"user",text}]);
    historyRef.current=[...historyRef.current,{role:"user",content:text}];
    setChatLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:CHAT_SYSTEM,messages:historyRef.current})
      });
      const data=await res.json();
      const reply=data.content?.[0]?.text||"No response.";
      historyRef.current=[...historyRef.current,{role:"assistant",content:reply}];
      setMessages(p=>[...p,{role:"agent",text:reply}]);
    }catch(e){setMessages(p=>[...p,{role:"agent",text:"Error: "+e.message}]);}
    finally{setChatLoading(false);}
  },[chatInput,chatLoading]);

  const generateProject=useCallback(async()=>{
    const q=projInput.trim();if(!q||projLoading)return;
    setProjLoading(true);setProjError("");setProject(null);setActiveStep(0);setImgUrl(null);setShowImg(false);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:PROJECT_SYSTEM,messages:[{role:"user",content:`Build project: ${q}. Keep code snippets under 15 lines. No backticks in code strings.`}]})
      });
      const data=await res.json();
      if(data.error)throw new Error("API: "+data.error.message);
      const raw=data.content?.[0]?.text||"";
      if(!raw)throw new Error("Empty response");

      // Robust JSON extraction: find outermost { } using bracket counting, ignoring strings
      const extractJSON=(s)=>{
        const start=s.indexOf("{");
        if(start===-1)throw new Error("No JSON object found in response");
        let depth=0,inStr=false,escape=false;
        for(let i=start;i<s.length;i++){
          const c=s[i];
          if(escape){escape=false;continue;}
          if(c==="\\"&&inStr){escape=true;continue;}
          if(c==='"'){inStr=!inStr;continue;}
          if(!inStr){
            if(c==="{")depth++;
            else if(c==="}"){depth--;if(depth===0)return s.slice(start,i+1);}
          }
        }
        throw new Error("Incomplete JSON in response");
      };

      const jsonStr=extractJSON(raw);
      // Sanitize: remove control characters outside of known safe chars
      const sanitized=jsonStr.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"");
      const json=JSON.parse(sanitized);

      // Ensure required fields exist with safe defaults
      if(!json.steps||!Array.isArray(json.steps))throw new Error("Invalid project structure");
      json.components=json.components||[];
      json.wiring=json.wiring||[];
      json.tips=json.tips||[];
      json.visual=json.visual||{boards:[],sensors:[]};
      // Sanitize code fields — strip any problematic chars
      json.steps=json.steps.map((s,i)=>({...s,n:s.n||i+1,code:(s.code||"").replace(/`/g,"'")}));

      setProject(json);
    }catch(e){setProjError("Parse error: "+e.message+". Try rephrasing your project description.");console.error(e);}
    finally{setProjLoading(false);}
  },[projInput,projLoading]);

  const generateImage=useCallback(async()=>{
    if(!project||imgLoading)return;
    setImgLoading(true);setShowImg(false);setImgUrl(null);
    try{
      const components=(project.components||[]).map(c=>c.name).join(", ");
      const wiring=(project.wiring||[]).map(w=>w.from+" -> "+w.to+" ("+w.color+")").join("; ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:3000,
          messages:[{role:"user",content:`Create a clean SVG circuit diagram for this project: "${project.title}".
Components: ${components}.
Wiring: ${wiring}.

Rules:
- Output ONLY raw SVG, starting with <svg and ending with </svg>. No explanation, no markdown.
- viewBox="0 0 700 420" width="700" height="420"
- White background rect first
- Draw each component as a labeled rectangle with rounded corners. Use the wiring colors for connecting lines.
- Add a title at top: "${project.title}"
- Add small labels on each component box
- Use clean minimal style: light gray fills (#f5f5f5), dark borders (#333), colored wires matching the wiring colors
- Space components evenly, connect them with colored lines matching wire colors
- Keep it simple and readable`}]
        })
      });
      const data=await res.json();
      const svgText=(data.content?.[0]?.text||"").trim();
      const start=svgText.indexOf("<svg");
      const end=svgText.lastIndexOf("</svg>")+6;
      if(start===-1||end<6)throw new Error("No SVG returned");
      const svg=svgText.slice(start,end);
      const blob=new Blob([svg],{type:"image/svg+xml"});
      const url=URL.createObjectURL(blob);
      setImgUrl(url);setShowImg(true);
    }catch(e){console.error(e);}
    finally{setImgLoading(false);}
  },[project,imgLoading]);

  const ds=DIFF[project?.difficulty]||DIFF.Intermediate;

  // Canvas panels — defined as stable variables, NOT inner components, so refs never detach
  const simCanvasPanel = (
    <div style={{position:"absolute",inset:0,background:"#0d0d14"}}>
      <canvas ref={simCanvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",cursor:"grab"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"14px 18px",background:"linear-gradient(transparent,rgba(10,10,15,0.98))",pointerEvents:"none"}}>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:700,color:"#f0f0ff",marginBottom:3,letterSpacing:"0.03em"}}>{boardInfo.title}</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:10,color:"#44445a",lineHeight:1.6}}>{boardInfo.specs}</div>
      </div>
    </div>
  );

  const projCanvasPanel = (
    <div style={{position:"absolute",inset:0,background:"#0d0d14"}}>
      <canvas ref={projCanvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",cursor:"grab"}}/>
      {project&&(
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 16px",background:"linear-gradient(transparent,rgba(10,10,15,0.98))",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:700,color:"#f0f0ff",marginBottom:6}}>{project.title}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
            {project.difficulty&&<span style={{fontSize:10,padding:"2px 8px",border:"1.5px solid "+ds.c,color:ds.c,background:ds.bg,fontFamily:"'Courier New',monospace",borderRadius:2}}>{project.difficulty}</span>}
            {project.time&&<span style={{fontSize:10,color:"#888",fontFamily:"'Courier New',monospace"}}>{"⏱ "+project.time}</span>}
            {project.cost&&<span style={{fontSize:10,color:"#888",fontFamily:"'Courier New',monospace"}}>{"💰 "+project.cost}</span>}
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",pointerEvents:"all"}}>
            {[...(project.visual?.boards||[]),...(project.visual?.sensors||[])].map((name,i)=>(
              <button key={i} onClick={()=>{
                const b=matchBoard(name);const se=matchSensor(name);
                if(b&&projSceneRef.current)projSceneRef.current.load(buildBoard(b,projSceneRef.current.mats));
                else if(se&&projSceneRef.current)projSceneRef.current.load(buildSensor(se,projSceneRef.current.mats));
              }} style={{fontSize:9,padding:"2px 8px",background:"#fff",border:"1.5px solid #ccc",color:"#555",borderRadius:2,fontFamily:"'Courier New',monospace",cursor:"pointer",letterSpacing:"0.04em"}}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
      {!project&&(
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#1e1e2e",letterSpacing:"0.1em",textTransform:"uppercase"}}>Generate a project to see 3D preview</div>
        </div>
      )}
    </div>
  );

  // ── HELPERS ──
  const renderMsgText=(text)=>{
    return text.split("\n").map(line=>
      line.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#00e5ff;font-weight:700">$1</strong>')
          .replace(/`(.*?)`/g,'<code style="background:#1e1e2e;padding:1px 6px;font-family:monospace;font-size:11px;color:#00e5ff;border-radius:4px;border:1px solid #2a2a3f">$1</code>')
    ).join("<br/>");
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return(
    <div style={{display:"flex",height:"100vh",background:"#0a0a0f",fontFamily:"'Courier New',monospace",color:"#f0f0ff",overflow:"hidden"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:220,flexShrink:0,background:"#080810",borderRight:"1px solid #1e1e2e",display:"flex",flexDirection:"column",padding:"16px 12px",gap:4}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",marginBottom:16}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#00e5ff,#7c3aed)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚡</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,letterSpacing:"0.1em",color:"#f0f0ff"}}>NEXUS<span style={{color:"#00e5ff"}}>AI</span></div>
            <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.06em"}}>Powered by Boot-Up</div>
          </div>
        </div>

        {/* Main nav */}
        <div style={{fontSize:9,color:"#2a2a3f",letterSpacing:"0.14em",padding:"0 12px",marginBottom:4}}>GENERAL</div>
        {[
          {id:"chat",icon:"💬",label:"AI Chat",sub:"Ask anything"},
          {id:"image",icon:"🖼",label:"Vision AI",sub:"Analyze images"},
          {id:"code",icon:"</> ",label:"Code AI",sub:"Copilot & editor"},
          {id:"voice",icon:"🎤",label:"Voice Mode",sub:"Talk to AI"},
        ].map(({id,icon,label,sub})=>(
          <button key={id} onClick={()=>setMode(id)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:mode===id?"rgba(0,229,255,0.08)":"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",borderLeft:mode===id?"2px solid #00e5ff":"2px solid transparent",transition:"all 0.15s",width:"100%"}}>
            <span style={{fontSize:16,flexShrink:0,width:20,textAlign:"center"}}>{icon}</span>
            <div>
              <div style={{fontSize:12,color:mode===id?"#00e5ff":"#8888aa",fontWeight:mode===id?700:400,fontFamily:"'Courier New',monospace"}}>{label}</div>
              <div style={{fontSize:9,color:"#44445a",fontFamily:"'Courier New',monospace"}}>{sub}</div>
            </div>
          </button>
        ))}

        <div style={{height:1,background:"#1e1e2e",margin:"8px 0"}}/>
        <div style={{fontSize:9,color:"#2a2a3f",letterSpacing:"0.14em",padding:"0 12px",marginBottom:4}}>ROBOTICS</div>
        {[
          {id:"sim",icon:"⚙",label:"3D Simulator",sub:"Hardware viewer"},
          {id:"project",icon:"⚡",label:"Project Builder",sub:"AI blueprints"},
          {id:"library",icon:"📦",label:"Parts Library",sub:"All components"},
          {id:"compare",icon:"📊",label:"Compare",sub:"Side by side"},
          {id:"cost",icon:"🛒",label:"Cost Estimator",sub:"Budget planner"},
        ].map(({id,icon,label,sub})=>(
          <button key={id} onClick={()=>{setMode("robotics");setTab(id);}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:(mode==="robotics"&&tab===id)?"rgba(124,58,237,0.08)":"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",borderLeft:(mode==="robotics"&&tab===id)?"2px solid #7c3aed":"2px solid transparent",transition:"all 0.15s",width:"100%"}}>
            <span style={{fontSize:14,flexShrink:0,width:20,textAlign:"center"}}>{icon}</span>
            <div>
              <div style={{fontSize:12,color:(mode==="robotics"&&tab===id)?"#7c3aed":"#8888aa",fontWeight:(mode==="robotics"&&tab===id)?700:400,fontFamily:"'Courier New',monospace"}}>{label}</div>
              <div style={{fontSize:9,color:"#44445a",fontFamily:"'Courier New',monospace"}}>{sub}</div>
            </div>
          </button>
        ))}

        {/* Bottom status */}
        <div style={{marginTop:"auto",padding:"10px 12px",background:"#0d0d14",borderRadius:8,border:"1px solid #1e1e2e"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#00e5ff",boxShadow:"0 0 6px #00e5ff",flexShrink:0}}/>
            <span style={{fontSize:10,color:"#44445a",letterSpacing:"0.06em"}}>NEXUS AI · ONLINE</span>
          </div>
          <div style={{fontSize:9,color:"#2a2a3f"}}>claude-sonnet-4 · v4.0</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

        {/* Top bar */}
        <div style={{height:52,flexShrink:0,borderBottom:"1px solid #1e1e2e",background:"rgba(10,10,15,0.95)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
          <div style={{fontSize:11,color:"#44445a",letterSpacing:"0.1em",textTransform:"uppercase"}}>
            {mode==="chat"&&"💬 AI Chat — Ask me anything"}
            {mode==="image"&&"🖼 Vision AI — Upload & analyze images"}
            {mode==="code"&&"</> Code AI — Copilot & editor"}
            {mode==="voice"&&"🎤 Voice Mode — Speak to AI"}
            {mode==="robotics"&&("⚙ Robotics — "+["3D Simulator","Project Builder","Parts Library","Compare","Cost Estimator"][["sim","project","library","compare","cost"].indexOf(tab)])}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* File upload */}
            <input ref={fileInputRef} type="file" accept=".js,.jsx,.ts,.tsx,.py,.cpp,.c,.java,.rs,.go,.html,.css,.json,.md,.txt" style={{display:"none"}} onChange={handleFileUpload}/>
            <input ref={imgInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImgUpload}/>
            {(mode==="chat"||mode==="image")&&(
              <button onClick={()=>imgInputRef.current?.click()} title="Upload image"
                style={{padding:"5px 12px",background:uploadedImg?"rgba(0,229,255,0.15)":"#111118",border:"1px solid",borderColor:uploadedImg?"#00e5ff":"#1e1e2e",color:uploadedImg?"#00e5ff":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:6,letterSpacing:"0.06em"}}>
                {uploadedImg?"📎 IMG READY":"📎 IMAGE"}
              </button>
            )}
            {mode==="code"&&(
              <button onClick={()=>fileInputRef.current?.click()}
                style={{padding:"5px 12px",background:"#111118",border:"1px solid #1e1e2e",color:"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:6,letterSpacing:"0.06em"}}>
                📂 OPEN FILE
              </button>
            )}
            <button onClick={toggleVoice}
              style={{padding:"5px 12px",background:isListening?"rgba(239,68,68,0.15)":"#111118",border:"1px solid",borderColor:isListening?"#ef4444":"#1e1e2e",color:isListening?"#ef4444":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:6,letterSpacing:"0.06em",animation:isListening?"pulse 1.5s infinite":"none"}}>
              {isListening?"🔴 LISTENING":"🎤 VOICE"}
            </button>
          </div>
        </div>

        {/* ── CHAT MODE ── */}
        {mode==="chat"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
              {chatMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",flexDirection:m.role==="user"?"row-reverse":"row",maxWidth:"80%",alignSelf:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:m.role==="user"?"linear-gradient(135deg,#7c3aed,#4f46e5)":"linear-gradient(135deg,#00e5ff,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                    {m.role==="user"?"U":"N"}
                  </div>
                  <div style={{padding:"12px 16px",background:m.role==="user"?"#111118":"#0d0d14",border:"1px solid",borderColor:m.role==="user"?"#2a2a3f":"#1e1e2e",borderRadius:m.role==="user"?"12px 2px 12px 12px":"2px 12px 12px 12px",maxWidth:"100%"}}>
                    <div style={{fontSize:9,color:m.role==="user"?"#7c3aed":"#00e5ff",marginBottom:6,letterSpacing:"0.1em",fontWeight:700}}>
                      {m.role==="user"?"YOU":"⚡ NEXUS AI"}
                    </div>
                    <div style={{fontSize:13,lineHeight:1.7,color:"#c8c8e8"}} dangerouslySetInnerHTML={{__html:renderMsgText(m.text)}}/>
                  </div>
                </div>
              ))}
              {chatBusy&&(
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>N</div>
                  <div style={{padding:"12px 16px",background:"#0d0d14",border:"1px solid #1e1e2e",borderRadius:"2px 12px 12px 12px"}}>
                    <div style={{fontSize:9,color:"#00e5ff",marginBottom:6,letterSpacing:"0.1em",fontWeight:700}}>⚡ NEXUS AI · THINKING</div>
                    <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00e5ff",animation:`bounce 1.2s ${i*0.2}s infinite`,opacity:0.7}}/>)}</div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            {uploadedImg&&(
              <div style={{padding:"8px 20px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",alignItems:"center",gap:10}}>
                <img src={uploadedImg} style={{height:40,width:40,objectFit:"cover",borderRadius:4,border:"1px solid #2a2a3f"}}/>
                <span style={{fontSize:11,color:"#44445a",fontFamily:"'Courier New',monospace"}}>Image attached — ask me anything about it</span>
                <button onClick={()=>setUploadedImg(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#2a2a3f",fontSize:16,cursor:"pointer"}}>×</button>
              </div>
            )}
            <div style={{padding:"12px 20px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea value={chatIn} onChange={e=>setChatIn(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendGenChat();}}}
                disabled={chatBusy} placeholder="Ask anything — coding, math, science, writing, analysis... (Enter to send, Shift+Enter for newline)"
                rows={1} style={{flex:1,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:13,padding:"10px 14px",outline:"none",resize:"none",minHeight:42,maxHeight:120,borderRadius:8,lineHeight:1.5,opacity:chatBusy?0.5:1}}/>
              <button onClick={()=>sendGenChat()} disabled={chatBusy}
                style={{background:"linear-gradient(135deg,#00e5ff,#0891b2)",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,padding:"10px 20px",cursor:chatBusy?"not-allowed":"pointer",letterSpacing:"0.08em",height:42,borderRadius:8,fontWeight:700,flexShrink:0,opacity:chatBusy?0.5:1}}>
                SEND ›
              </button>
            </div>
            {/* Quick prompts */}
            <div style={{padding:"8px 20px 12px",display:"flex",gap:6,flexWrap:"wrap",borderTop:"1px solid #1e1e2e"}}>
              {["Explain quantum computing","Write a Python web scraper","Debug my JavaScript","What is LLM fine-tuning?","Write a cover letter","Solve: x² + 5x + 6 = 0"].map(p=>(
                <button key={p} onClick={()=>sendGenChat(p)}
                  style={{padding:"4px 10px",background:"#111118",border:"1px solid #1e1e2e",color:"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:6,transition:"all 0.15s",letterSpacing:"0.04em"}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── IMAGE / VISION MODE ── */}
        {mode==="image"&&(
          <div style={{flex:1,display:"flex",gap:0,minHeight:0,overflow:"hidden"}}>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,borderRight:"1px solid #1e1e2e",background:"#0a0a0f"}}>
              {!uploadedImg?(
                <div onClick={()=>imgInputRef.current?.click()} style={{width:"100%",maxWidth:400,height:280,border:"2px dashed #1e1e2e",borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:12,transition:"all 0.2s"}}>
                  <div style={{fontSize:48,opacity:0.3}}>🖼</div>
                  <div style={{fontFamily:"'Courier New',monospace",fontSize:12,color:"#44445a",textAlign:"center",letterSpacing:"0.08em"}}>CLICK TO UPLOAD IMAGE</div>
                  <div style={{fontFamily:"'Courier New',monospace",fontSize:10,color:"#2a2a3f"}}>JPG, PNG, GIF, WEBP supported</div>
                </div>
              ):(
                <div style={{width:"100%",maxWidth:500,display:"flex",flexDirection:"column",gap:12}}>
                  <img src={uploadedImg} style={{width:"100%",maxHeight:320,objectFit:"contain",borderRadius:8,border:"1px solid #1e1e2e"}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={analyzeImage} disabled={imgBusy}
                      style={{flex:1,padding:"10px",background:"linear-gradient(135deg,#00e5ff,#0891b2)",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:11,cursor:imgBusy?"not-allowed":"pointer",borderRadius:8,fontWeight:700,letterSpacing:"0.08em",opacity:imgBusy?0.6:1}}>
                      {imgBusy?"ANALYZING...":"🔍 ANALYZE IMAGE"}
                    </button>
                    <button onClick={()=>{setUploadedImg(null);setImgAnalysis("");}}
                      style={{padding:"10px 16px",background:"transparent",border:"1px solid #2a2a3f",color:"#44445a",fontFamily:"'Courier New',monospace",fontSize:11,cursor:"pointer",borderRadius:8}}>
                      CLEAR
                    </button>
                  </div>
                  <div style={{fontSize:10,color:"#2a2a3f",fontFamily:"'Courier New',monospace",textAlign:"center"}}>Or ask a question in chat with the image attached ↗</div>
                </div>
              )}
            </div>
            <div style={{width:380,flexShrink:0,display:"flex",flexDirection:"column",padding:20,overflowY:"auto",background:"#0d0d14"}}>
              <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> ANALYSIS RESULT</div>
              {!imgAnalysis&&!imgBusy&&(
                <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#2a2a3f",lineHeight:1.8}}>
                  Upload an image and click Analyze, or attach it in Chat mode to ask specific questions about it.
                  <br/><br/>Works great for:<br/>
                  {"· Circuit diagrams & PCBs"}<br/>
                  {"· Code screenshots"}<br/>
                  {"· Error messages"}<br/>
                  {"· Charts & graphs"}<br/>
                  {"· Any photo or screenshot"}
                </div>
              )}
              {imgBusy&&<div style={{display:"flex",gap:4,marginTop:8}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#00e5ff",animation:`bounce 1.2s ${i*0.2}s infinite`,opacity:0.7}}/>)}</div>}
              {imgAnalysis&&(
                <div style={{fontSize:13,lineHeight:1.8,color:"#8888aa"}} dangerouslySetInnerHTML={{__html:renderMsgText(imgAnalysis)}}/>
              )}
            </div>
          </div>
        )}

        {/* ── CODE MODE ── */}
        {mode==="code"&&(
          <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>
            {/* Editor */}
            <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,borderRight:"1px solid #1e1e2e"}}>
              <div style={{padding:"8px 16px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <select value={codeLang} onChange={e=>setCodeLang(e.target.value)}
                  style={{background:"#111118",border:"1px solid #2a2a3f",color:"#8888aa",fontFamily:"'Courier New',monospace",fontSize:10,padding:"4px 8px",borderRadius:4,cursor:"pointer",outline:"none"}}>
                  {["javascript","typescript","python","cpp","java","rust","go","html","css","json"].map(l=>(
                    <option key={l} value={l}>{l.toUpperCase()}</option>
                  ))}
                </select>
                <span style={{fontSize:9,color:"#2a2a3f",letterSpacing:"0.1em",marginLeft:"auto"}}>EDITOR · AI COPILOT</span>
              </div>
              <textarea value={codeInput} onChange={e=>setCodeInput(e.target.value)}
                spellCheck={false}
                style={{flex:1,background:"#080810",border:"none",color:"#8888aa",fontFamily:"'Courier New',monospace",fontSize:13,padding:"16px",outline:"none",resize:"none",lineHeight:1.8,tabSize:2}}/>
              <div style={{padding:"10px 16px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
                {[["explain","💡 EXPLAIN"],["fix","🔧 FIX BUGS"],["improve","⚡ IMPROVE"],["complete","✨ COMPLETE"],["test","🧪 WRITE TESTS"]].map(([a,l])=>(
                  <button key={a} onClick={()=>askCodeAI(a)} disabled={codeBusy}
                    style={{padding:"6px 14px",background:codeBusy?"#0d0d14":"#111118",border:"1px solid #1e1e2e",color:codeBusy?"#2a2a3f":"#8888aa",fontFamily:"'Courier New',monospace",fontSize:10,cursor:codeBusy?"not-allowed":"pointer",borderRadius:6,letterSpacing:"0.06em",transition:"all 0.15s"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* Output */}
            <div style={{width:"45%",flexShrink:0,display:"flex",flexDirection:"column",minWidth:300}}>
              <div style={{padding:"8px 16px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",fontSize:9,color:"#44445a",letterSpacing:"0.14em",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{color:"#7c3aed"}}>▸</span> AI RESPONSE
                {codeBusy&&<div style={{display:"flex",gap:3,marginLeft:8}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#7c3aed",animation:`bounce 1s ${i*0.15}s infinite`,opacity:0.7}}/>)}</div>}
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"16px",background:"#080810"}}>
                {!codeOutput&&!codeBusy&&(
                  <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#2a2a3f",lineHeight:1.9}}>
                    Write or paste code on the left, then click an action:{"

"}
                    💡 Explain — understand what it does{"
"}
                    🔧 Fix Bugs — find and fix issues{"
"}
                    ⚡ Improve — optimize and refactor{"
"}
                    ✨ Complete — finish incomplete code{"
"}
                    🧪 Write Tests — add unit tests
                  </div>
                )}
                {codeOutput&&(
                  <div style={{fontSize:12,lineHeight:1.8,color:"#8888aa",whiteSpace:"pre-wrap",fontFamily:"'Courier New',monospace"}} dangerouslySetInnerHTML={{__html:renderMsgText(codeOutput)}}/>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── VOICE MODE ── */}
        {mode==="voice"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,background:"#0a0a0f",padding:40}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:12,color:"#44445a",letterSpacing:"0.14em",marginBottom:8}}>VOICE INPUT MODE</div>
              <div style={{fontSize:11,color:"#2a2a3f",lineHeight:1.8}}>Click the button below and speak — your words will be sent to AI Chat</div>
            </div>
            <button onClick={toggleVoice}
              style={{width:120,height:120,borderRadius:"50%",background:isListening?"rgba(239,68,68,0.15)":"rgba(0,229,255,0.08)",border:`2px solid ${isListening?"#ef4444":"#00e5ff"}`,color:isListening?"#ef4444":"#00e5ff",fontSize:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",boxShadow:isListening?"0 0 40px rgba(239,68,68,0.2)":"0 0 20px rgba(0,229,255,0.1)",animation:isListening?"pulse 1.5s infinite":"none"}}>
              {isListening?"🔴":"🎤"}
            </button>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:12,color:"#44445a",letterSpacing:"0.08em"}}>
              {isListening?"LISTENING — SPEAK NOW...":"CLICK TO START LISTENING"}
            </div>
            {transcript&&(
              <div style={{maxWidth:500,width:"100%",padding:"16px 20px",background:"#111118",border:"1px solid #1e1e2e",borderRadius:8}}>
                <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.12em",marginBottom:8}}>TRANSCRIPT</div>
                <div style={{fontSize:13,color:"#c8c8e8",lineHeight:1.7}}>{transcript}</div>
                <button onClick={()=>{setMode("chat");sendGenChat(transcript);setTranscript("");}}
                  style={{marginTop:12,padding:"8px 20px",background:"linear-gradient(135deg,#00e5ff,#0891b2)",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:6,fontWeight:700,letterSpacing:"0.08em"}}>
                  SEND TO AI ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ROBOTICS MODE ── */}
        {mode==="robotics"&&(

      {/* ══ SIM TAB ══ */}
      <div style={{display:tab==="sim"?"grid":"none",gridTemplateColumns:"1fr 1fr",flex:1,minHeight:0,overflow:"hidden"}}>

        {/* LEFT — 3D viewer */}
        <div style={{display:"flex",flexDirection:"column",borderRight:"1px solid #1e1e2e",minHeight:0,overflow:"hidden"}}>
          <div style={{fontSize:9,color:"#44445a",padding:"6px 16px",borderBottom:"1px solid #1e1e2e",letterSpacing:"0.16em",textTransform:"uppercase",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#00e5ff"}}>▸</span> HARDWARE SIMULATION ENGINE
          </div>
          <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:0}}>
            {simCanvasPanel}
          </div>
          <div style={{flexShrink:0,padding:"10px 16px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#00e5ff",whiteSpace:"nowrap",letterSpacing:"0.1em",fontWeight:700}}>LOAD ›</span>
            <input value={simInput} onChange={e=>setSimInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadObject()}
              placeholder="Arduino Uno, ESP32, RPi 5, DHT22, OLED, Servo..."
              style={{flex:1,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:12,padding:"8px 12px",outline:"none",borderRadius:6,transition:"border-color 0.2s"}}/>
            <button onClick={loadObject}
              style={{background:"#00e5ff",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,padding:"8px 18px",cursor:"pointer",letterSpacing:"0.08em",borderRadius:6,fontWeight:700,transition:"opacity 0.2s"}}>
              SIM
            </button>
          </div>
        </div>

        {/* RIGHT — CHAT */}
        <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
          <div style={{fontSize:9,color:"#44445a",padding:"6px 16px",borderBottom:"1px solid #1e1e2e",letterSpacing:"0.16em",textTransform:"uppercase",flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#7c3aed"}}>▸</span> AI ENGINEERING ASSISTANT
          </div>
          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:10,minHeight:0,background:"#0a0a0f"}}>
            {messages.map((msg,i)=>(
              <div key={i} style={{maxWidth:"88%",padding:"10px 14px",fontSize:13,alignSelf:msg.role==="user"?"flex-end":"flex-start",
                background:msg.role==="user"?"#111118":"#0d0d14",
                border:"1px solid",
                borderColor:msg.role==="user"?"#2a2a3f":"#1e1e2e",
                borderLeft:msg.role==="agent"?"3px solid #00e5ff":undefined,
                borderRight:msg.role==="user"?"3px solid #7c3aed":undefined,
                borderRadius:8,color:"#c8c8e8"}}>
                <div style={{fontSize:9,marginBottom:5,color:msg.role==="user"?"#7c3aed":"#00e5ff",fontWeight:700,letterSpacing:"0.1em"}}>
                  {msg.role==="agent"?"⚡ BOOT-UP":"YOU"}
                </div>
                <MsgText text={msg.text}/>
              </div>
            ))}
            {chatLoading&&(
              <div style={{alignSelf:"flex-start",padding:"10px 14px",background:"#0d0d14",border:"1px solid #1e1e2e",borderLeft:"3px solid #00e5ff",borderRadius:8}}>
                <div style={{fontSize:9,color:"#00e5ff",marginBottom:6,fontWeight:700,letterSpacing:"0.1em"}}>⚡ BOOT-UP · THINKING</div>
                <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#00e5ff",animation:`bounce 1.2s ${i*0.2}s infinite`,opacity:0.8}}/>)}</div>
              </div>
            )}
          </div>
          <div style={{flexShrink:0,padding:"10px 16px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}}
              disabled={chatLoading} placeholder="Ask about wiring, pinouts, code, robotics..."
              rows={1} style={{flex:1,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:12,padding:"8px 12px",outline:"none",resize:"none",minHeight:36,maxHeight:100,borderRadius:6,lineHeight:1.5,opacity:chatLoading?0.4:1,transition:"border-color 0.2s"}}/>
            <button onClick={sendChat} disabled={chatLoading}
              style={{background:chatLoading?"#1e1e2e":"#00e5ff",border:"none",color:chatLoading?"#44445a":"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,padding:"8px 18px",cursor:chatLoading?"not-allowed":"pointer",letterSpacing:"0.08em",height:36,borderRadius:6,fontWeight:700,transition:"all 0.2s"}}>
              SEND ›
            </button>
          </div>
        </div>
      </div>

      {/* ══ PROJECT TAB ══ */}
      <div style={{display:tab==="project"?"flex":"none",flexDirection:"column",flex:1,minHeight:0,overflow:"hidden"}}>

        {/* Input bar */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",flexShrink:0,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:9,color:"#00e5ff",whiteSpace:"nowrap",letterSpacing:"0.12em",fontWeight:700}}>PROJECT ›</span>
          <input value={projInput} onChange={e=>setProjInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generateProject()}
            placeholder="Describe your project... e.g. motion-activated alarm with LED and buzzer"
            style={{flex:1,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:12,padding:"9px 14px",outline:"none",borderRadius:6}}/>
          <button onClick={generateProject} disabled={projLoading}
            style={{background:projLoading?"#1e1e2e":"#00e5ff",border:"none",color:projLoading?"#44445a":"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,padding:"9px 22px",cursor:projLoading?"not-allowed":"pointer",letterSpacing:"0.08em",borderRadius:6,whiteSpace:"nowrap",fontWeight:700,transition:"all 0.2s"}}>
            {projLoading?"BUILDING...":"BUILD ›"}
          </button>
        </div>

        {projError&&<div style={{padding:"8px 20px",background:"rgba(255,50,50,0.08)",borderBottom:"1px solid rgba(255,50,50,0.2)",color:"#ff6b6b",fontSize:11,flexShrink:0,fontFamily:"'Courier New',monospace"}}>{projError}</div>}

        {/* Loading */}
        {projLoading&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,background:"#0a0a0f"}}>
            <div style={{display:"flex",gap:6}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#00e5ff",animation:`bounce 1.2s ${i*0.15}s infinite`,opacity:0.8}}/>)}</div>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:10,color:"#44445a",letterSpacing:"0.16em",textTransform:"uppercase"}}>Generating Project Blueprint...</div>
          </div>
        )}

        {/* Empty state */}
        {!projLoading&&!project&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:40,background:"#0a0a0f"}}>
            <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,rgba(0,229,255,0.1),rgba(124,58,237,0.1))",border:"1px solid #1e1e2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>⚡</div>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:14,color:"#2a2a4a",letterSpacing:"0.1em",textTransform:"uppercase"}}>Describe Your Project</div>
            <div style={{fontSize:11,color:"#2a2a4a",textAlign:"center",lineHeight:2.4,maxWidth:520,fontFamily:"'Courier New',monospace"}}>
              {""Smart plant watering system" · "RFID door lock" · "Obstacle avoiding robot" · "Weather station with OLED""}
            </div>
          </div>
        )}

        {/* Project result — grid with 3D + steps */}
        {!projLoading&&project&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",flex:1,minHeight:0,overflow:"hidden"}}>

            {/* LEFT — 3D + components + wiring */}
            <div style={{display:"flex",flexDirection:"column",borderRight:"1px solid #1e1e2e",minHeight:0,overflow:"hidden"}}>
              <div style={{fontSize:9,color:"#44445a",padding:"6px 16px",borderBottom:"1px solid #1e1e2e",letterSpacing:"0.14em",textTransform:"uppercase",flexShrink:0,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> 3D PREVIEW · CLICK PART TO SWITCH · DRAG TO ROTATE</div>
              <div style={{flex:"0 0 50%",position:"relative",minHeight:0}}>
                {projCanvasPanel}
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"12px 16px",borderTop:"1px solid #1e1e2e",background:"#0a0a0f"}}>
                <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> COMPONENTS</div>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
                  {(project.components||[]).map((c,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"baseline",gap:8,fontSize:11}}>
                      <span style={{color:"#00e5ff",fontFamily:"'Courier New',monospace",minWidth:24,flexShrink:0,fontWeight:700}}>×{c.qty}</span>
                      <span style={{color:"#f0f0ff",fontWeight:600,flexShrink:0}}>{c.name}</span>
                      <span style={{color:"#44445a",fontSize:10}}>— {c.purpose}</span>
                    </div>
                  ))}
                </div>
                {(project.wiring||[]).length>0&&(
                  <>
                    <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#7c3aed"}}>▸</span> WIRING</div>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      {(project.wiring||[]).map((w,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:10,padding:"5px 8px",background:"#111118",borderRadius:4,border:"1px solid #1e1e2e"}}>
                          <span style={{color:"#8888aa",fontFamily:"'Courier New',monospace",minWidth:110,flexShrink:0}}>{w.from}</span>
                          <span style={{width:8,height:8,borderRadius:"50%",background:w.color||"#888",border:"1px solid rgba(0,0,0,0.1)",display:"inline-block",flexShrink:0}}/>
                          <span style={{color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontWeight:600}}>{w.to}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT — step-by-step guide */}
            <div style={{display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
              <div style={{fontSize:9,color:"#44445a",padding:"6px 16px",borderBottom:"1px solid #1e1e2e",letterSpacing:"0.14em",textTransform:"uppercase",flexShrink:0,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#7c3aed"}}>▸</span> BUILD GUIDE · {(project.steps||[]).length} STEPS</div>
              {/* Step tabs */}
              <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #1e1e2e",flexShrink:0,background:"#0d0d14"}}>
                {(project.steps||[]).map((s,i)=>(
                  <button key={i} onClick={()=>setActiveStep(i)}
                    style={{padding:"8px 18px",background:"transparent",border:"none",borderBottom:activeStep===i?"2px solid #00e5ff":"2px solid transparent",color:activeStep===i?"#00e5ff":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:"0.08em",fontWeight:activeStep===i?700:400,transition:"color 0.2s"}}>
                    {i+1}
                  </button>
                ))}
              </div>
              {/* Step content */}
              <div style={{flex:1,overflowY:"auto",padding:"18px 20px",background:"#0a0a0f"}}>
                {(project.steps||[])[activeStep]&&(()=>{
                  const s=project.steps[activeStep];
                  return(
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",fontSize:11,color:"#0a0a0f",flexShrink:0,fontWeight:700}}>{s.n}</div>
                        <div style={{fontFamily:"Georgia,serif",fontSize:15,color:"#f0f0ff",fontWeight:400}}>{s.title}</div>
                      </div>
                      <div style={{fontSize:13,lineHeight:1.85,color:"#8888aa",fontFamily:"Georgia,serif"}}>{s.desc}</div>
                      <CodeBlock code={s.code}/>
                      {activeStep===(project.steps||[]).length-1&&(project.tips||[]).length>0&&(
                        <div style={{marginTop:20}}>
                          <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> PRO TIPS</div>
                          <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            {project.tips.map((tip,i)=>(
                              <div key={i} style={{fontSize:12,color:"#8888aa",padding:"8px 12px",borderLeft:"3px solid #00e5ff",background:"#0d0d14",lineHeight:1.7,fontFamily:"Georgia,serif",borderRadius:"0 4px 4px 0"}}>{tip}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              {/* Step nav */}
              <div style={{flexShrink:0,padding:"10px 16px",borderTop:"1px solid #1e1e2e",background:"#0d0d14",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <button onClick={()=>setActiveStep(s=>Math.max(0,s-1))} disabled={activeStep===0}
                  style={{background:"transparent",border:"1px solid",borderColor:activeStep===0?"#1e1e2e":"#2a2a3f",color:activeStep===0?"#2a2a3f":"#8888aa",fontFamily:"'Courier New',monospace",fontSize:10,padding:"6px 14px",cursor:activeStep===0?"default":"pointer",letterSpacing:"0.06em",borderRadius:6,transition:"all 0.2s"}}>← PREV</button>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,color:"#bbb",fontFamily:"'Courier New',monospace"}}>STEP {activeStep+1} / {(project.steps||[]).length}</span>
                  <button onClick={()=>{if(showImg){setShowImg(false);}else{generateImage();}}}
                    style={{background:showImg?"#00e5ff":imgLoading?"#1e1e2e":"#111118",border:"1px solid",borderColor:showImg?"#00e5ff":imgLoading?"#1e1e2e":"#2a2a3f",color:showImg?"#0a0a0f":imgLoading?"#44445a":"#8888aa",fontFamily:"'Courier New',monospace",fontSize:10,padding:"6px 14px",cursor:imgLoading?"not-allowed":"pointer",letterSpacing:"0.06em",borderRadius:2,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}>
                    {imgLoading?<><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",border:"1.5px solid #bbb",borderTopColor:"#555",animation:"spin 0.8s linear infinite"}}/>{"LOADING..."}</>:showImg?"✕ HIDE DIAGRAM":"⬡ VIEW DIAGRAM"}
                  </button>
                </div>
                <button onClick={()=>setActiveStep(s=>Math.min((project.steps||[]).length-1,s+1))} disabled={activeStep===(project.steps||[]).length-1}
                  style={{background:"transparent",border:"1px solid",borderColor:activeStep===(project.steps||[]).length-1?"#1e1e2e":"#2a2a3f",color:activeStep===(project.steps||[]).length-1?"#2a2a3f":"#8888aa",fontFamily:"'Courier New',monospace",fontSize:10,padding:"6px 14px",cursor:activeStep===(project.steps||[]).length-1?"default":"pointer",letterSpacing:"0.06em",borderRadius:6,transition:"all 0.2s"}}>NEXT →</button>
              </div>

              {/* Image panel — slides in above step nav */}
              {showImg&&imgUrl&&(
                <div style={{flexShrink:0,borderTop:"1px solid #1e1e2e",background:"#0d0d14",overflow:"hidden",animation:"slideDown 0.25s ease"}}>
                  <div style={{padding:"8px 16px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> CIRCUIT DIAGRAM</span>
                    <span style={{fontSize:9,color:"#44445a",fontFamily:"'Courier New',monospace",fontStyle:"italic"}}>AI Generated</span>
                  </div>
                  <img src={imgUrl} alt={project.title}
                    style={{width:"100%",height:220,objectFit:"contain",display:"block",borderTop:"1px solid #e8e8e8",background:"#fff",padding:"8px"}}
                    onError={e=>{e.target.style.display="none";}}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* ══ LIBRARY TAB ══ */}
      {tab==="library"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",background:"#0a0a0f"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",flexShrink:0,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="Search boards and sensors..."
              style={{flex:1,minWidth:200,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:12,padding:"8px 12px",outline:"none",borderRadius:6}}/>
            {["all","boards","sensors"].map(f=>(
              <button key={f} onClick={()=>setLibFilter(f)}
                style={{padding:"6px 14px",background:libFilter===f?"#00e5ff":"transparent",border:"1px solid",borderColor:libFilter===f?"#00e5ff":"#2a2a3f",color:libFilter===f?"#0a0a0f":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2,letterSpacing:"0.04em",textTransform:"uppercase"}}>
                {f}
              </button>
            ))}
            <span style={{fontSize:10,color:"#aaa",fontFamily:"'Courier New',monospace"}}>
              {(()=>{
                const bk=Object.keys(BOARDS).filter(k=>libFilter!=="sensors"&&(k.includes(libSearch.toLowerCase())||BOARDS[k].title.toLowerCase().includes(libSearch.toLowerCase())));
                const sk=Object.keys(SENSORS).filter(k=>libFilter!=="boards"&&(k.includes(libSearch.toLowerCase())||SENSORS[k].title.toLowerCase().includes(libSearch.toLowerCase())));
                return (libFilter==="all"?bk.length+sk.length:libFilter==="boards"?bk.length:sk.length)+" parts";
              })()}
            </span>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px",background:"#0a0a0f"}}>
            {(libFilter==="all"||libFilter==="boards")&&(
              <>
                <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12,fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> BOARDS — {Object.keys(BOARDS).length} total</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8,marginBottom:24}}>
                  {Object.entries(BOARDS).filter(([k,v])=>k.includes(libSearch.toLowerCase())||v.title.toLowerCase().includes(libSearch.toLowerCase())||v.specs.toLowerCase().includes(libSearch.toLowerCase())).map(([k,v])=>(
                    <div key={k} style={{border:"1px solid #1e1e2e",borderRadius:8,padding:"10px 14px",background:"#111118",cursor:"pointer",transition:"all 0.2s"}}
                      onClick={()=>{setTab("sim");setSimInput(k);}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:"#"+v.color.toString(16).padStart(6,"0"),border:"1px solid #ccc",flexShrink:0}}/>
                        <span style={{fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:700,color:"#f0f0ff"}}>{v.title}</span>
                      </div>
                      <div style={{fontFamily:"'Courier New',monospace",fontSize:9,color:"#44445a",lineHeight:1.6}}>{v.specs}</div>
                      <div style={{marginTop:6,display:"flex",gap:4}}>
                        <span style={{fontSize:9,padding:"2px 6px",background:"#1e1e2e",border:"1px solid #2a2a3f",borderRadius:4,color:"#44445a",fontFamily:"'Courier New',monospace"}}>{v.shape.toUpperCase()}</span>
                        <span style={{fontSize:9,padding:"2px 6px",background:"#1e1e2e",border:"1px solid #2a2a3f",borderRadius:4,color:"#44445a",fontFamily:"'Courier New',monospace",cursor:"pointer"}}
                          onClick={e=>{e.stopPropagation();setCartItems(p=>p.find(x=>x.key===k)?p:[...p,{key:k,name:v.title,price:v.shape==="rpi"?35:v.shape==="mega"?18:v.shape==="uno"?12:8,type:"board"}]);}}>
                          + CART
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {(libFilter==="all"||libFilter==="sensors")&&(
              <>
                <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12,fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#7c3aed"}}>▸</span> SENSORS & Modules — {Object.keys(SENSORS).length} total</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
                  {Object.entries(SENSORS).filter(([k,v])=>k.includes(libSearch.toLowerCase())||v.title.toLowerCase().includes(libSearch.toLowerCase())||v.specs.toLowerCase().includes(libSearch.toLowerCase())).map(([k,v])=>(
                    <div key={k} style={{border:"1px solid #1e1e2e",borderRadius:8,padding:"10px 14px",background:"#111118",cursor:"pointer",transition:"all 0.2s"}}
                      onClick={()=>{setTab("sim");setSimInput(k);}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:700,color:"#f0f0ff"}}>{v.title}</span>
                      </div>
                      <div style={{fontFamily:"'Courier New',monospace",fontSize:9,color:"#44445a",lineHeight:1.6}}>{v.specs}</div>
                      <div style={{marginTop:6,display:"flex",gap:4}}>
                        <span style={{fontSize:9,padding:"2px 6px",background:"#1e1e2e",border:"1px solid #2a2a3f",borderRadius:4,color:"#44445a",fontFamily:"'Courier New',monospace"}}>{v.pins} PINS</span>
                        <span style={{fontSize:9,padding:"2px 6px",background:"#1e1e2e",border:"1px solid #2a2a3f",borderRadius:4,color:"#44445a",fontFamily:"'Courier New',monospace",cursor:"pointer"}}
                          onClick={e=>{e.stopPropagation();setCartItems(p=>p.find(x=>x.key===k)?p:[...p,{key:k,name:v.title,price:["servo","rfid","l298n","bluetooth"].includes(v.type)?6:["oled","lcd"].includes(v.type)?8:3,type:"sensor"}]);}}>
                          + CART
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ COMPARE TAB ══ */}
      {tab==="compare"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",background:"#0a0a0f"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",flexShrink:0,display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#00e5ff",fontWeight:700,letterSpacing:"0.12em",fontFamily:"'Courier New',monospace"}}>COMPARE ›</span>
            {[["compareA",compareA,setCompareA],["compareB",compareB,setCompareB]].map(([id,val,setter],i)=>(
              <input key={id} value={val} onChange={e=>setter(e.target.value)} placeholder={"Board "+(i+1)+" e.g. arduino uno"}
                style={{flex:1,background:"#111118",border:"1px solid #2a2a3f",color:"#f0f0ff",fontFamily:"'Courier New',monospace",fontSize:12,padding:"8px 12px",outline:"none",borderRadius:6}}/>
            ))}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"20px",background:"#0a0a0f"}}>
            {(()=>{
              const a=matchBoard(compareA)||matchSensor(compareA);
              const b=matchBoard(compareB)||matchSensor(compareB);
              if(!a&&!b)return(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
                  <div style={{fontSize:40,opacity:0.07}}>📊</div>
                  <div style={{fontFamily:"'Courier New',monospace",fontSize:13,color:"#ccc"}}>Type two boards or sensors above to compare</div>
                  <div style={{fontSize:11,color:"#ddd",fontFamily:"'Courier New',monospace",textAlign:"center"}}>e.g. "arduino uno" vs "arduino mega" · "esp32" vs "raspberry pi pico" · "dht22" vs "dht11"</div>
                </div>
              );
              const rows=[["Title","title"],["Specs","specs"],["Shape/Type",a?.shape||a?.type||"—"],["Size",a?.size?a.size.join(" × ")+"cm":"—"]];
              return(
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,border:"1px solid #1e1e2e",borderRadius:8,overflow:"hidden"}}>
                    <div style={{padding:"10px 14px",background:"#0d0d14",borderRight:"1px solid #1e1e2e",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:9,color:"#44445a",letterSpacing:"0.12em",textTransform:"uppercase"}}>SPEC</div>
                    <div style={{padding:"10px 14px",background:"#0d0d14",borderRight:"1px solid #1e1e2e",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:700,color:"#00e5ff"}}>{a?a.title:"—"}</div>
                    <div style={{padding:"10px 14px",background:"#0d0d14",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:700,color:"#7c3aed"}}>{b?b.title:"—"}</div>
                    {[["Specs",a?.specs||"—",b?.specs||"—"],["Form Factor",(a?.shape||a?.type||"—").toUpperCase(),(b?.shape||b?.type||"—").toUpperCase()],["Size",a?.size?a.size.join(" × ")+" cm":"—",b?.size?b.size.join(" × ")+" cm":"—"],["Pins",a?.pins||"—",b?.pins||"—"]].map(([label,va,vb],i)=>(
                      <React.Fragment key={i}>
                        <div style={{padding:"10px 14px",borderRight:"1px solid #1e1e2e",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:9,color:"#44445a",letterSpacing:"0.1em",textTransform:"uppercase",background:"#111118"}}>{label}</div>
                        <div style={{padding:"10px 14px",borderRight:"1px solid #1e1e2e",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:11,color:"#8888aa",lineHeight:1.6}}>{va}</div>
                        <div style={{padding:"10px 14px",borderBottom:"1px solid #1e1e2e",fontFamily:"'Courier New',monospace",fontSize:11,color:"#8888aa",lineHeight:1.6}}>{vb}</div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{marginTop:16,display:"flex",gap:8}}>
                    {a&&<button onClick={()=>{setTab("sim");setSimInput(compareA);}} style={{padding:"7px 16px",background:"#00e5ff",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2,letterSpacing:"0.06em"}}>VIEW {a.title} IN 3D</button>}
                    {b&&<button onClick={()=>{setTab("sim");setSimInput(compareB);}} style={{padding:"7px 16px",background:"#00e5ff",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2,letterSpacing:"0.06em"}}>VIEW {b.title} IN 3D</button>}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══ COST TAB ══ */}
      {tab==="cost"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden",background:"#0a0a0f"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid #1e1e2e",background:"#0d0d14",flexShrink:0,display:"flex",gap:10,alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:10,color:"#1a1a1a",fontWeight:700,letterSpacing:"0.06em",fontFamily:"'Courier New',monospace"}}>🛒 PARTS COST ESTIMATOR</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {cartItems.length>0&&<button onClick={()=>setCartItems([])} style={{padding:"6px 12px",background:"transparent",border:"1px solid #2a2a3f",color:"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2}}>CLEAR ALL</button>}
              <span style={{fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:700,color:"#00e5ff"}}>
                TOTAL: ${cartItems.reduce((s,i)=>s+i.price,0).toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px",borderRight:"1px solid #1e1e2e",background:"#0a0a0f"}}>
              <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12,fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#00e5ff"}}>▸</span> QUICK ADD — click any part</div>
              <div style={{fontSize:9,color:"#2a2a3f",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Courier New',monospace"}}>BOARDS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {[["arduino uno",12],["arduino nano",5],["esp32",8],["raspberry pi pico",6],["raspberry pi 4",45],["stm32",4],["arduino mega",18],["esp8266",4]].map(([k,price])=>(
                  <button key={k} onClick={()=>setCartItems(p=>p.find(x=>x.key===k)?p:[...p,{key:k,name:BOARDS[k]?.title||k,price,type:"board"}])}
                    style={{padding:"5px 10px",background:cartItems.find(x=>x.key===k)?"#00e5ff":"#111118",border:"1px solid",borderColor:cartItems.find(x=>x.key===k)?"#00e5ff":"#1e1e2e",color:cartItems.find(x=>x.key===k)?"#0a0a0f":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2}}>
                    {k} <span style={{opacity:0.6}}>${price}</span>
                  </button>
                ))}
              </div>
              <div style={{fontSize:9,color:"#2a2a3f",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Courier New',monospace"}}>SENSORS</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {[["hc-sr04",2],["dht22",3],["pir",2],["oled",8],["servo",3],["relay",2],["rfid",4],["mpu6050",3],["neopixel",5],["lcd 16x2",7],["hc-05",6],["l298n",5]].map(([k,price])=>(
                  <button key={k} onClick={()=>setCartItems(p=>p.find(x=>x.key===k)?p:[...p,{key:k,name:SENSORS[k]?.title||k,price,type:"sensor"}])}
                    style={{padding:"5px 10px",background:cartItems.find(x=>x.key===k)?"#00e5ff":"#111118",border:"1px solid",borderColor:cartItems.find(x=>x.key===k)?"#00e5ff":"#1e1e2e",color:cartItems.find(x=>x.key===k)?"#0a0a0f":"#44445a",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2}}>
                    {k} <span style={{opacity:0.6}}>${price}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{width:280,flexShrink:0,overflowY:"auto",padding:"16px",background:"#0d0d14",borderLeft:"1px solid #1e1e2e"}}>
              <div style={{fontSize:9,color:"#44445a",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12,fontFamily:"'Courier New',monospace",display:"flex",alignItems:"center",gap:6}}><span style={{color:"#7c3aed"}}>▸</span> YOUR PARTS LIST</div>
              {cartItems.length===0?(
                <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#2a2a3f",textAlign:"center",marginTop:40}}>Click parts on the left to add them</div>
              ):(
                <>
                  {cartItems.map((item,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1e1e2e"}}>
                      <div>
                        <div style={{fontFamily:"'Courier New',monospace",fontSize:11,color:"#f0f0ff",fontWeight:600}}>{item.name}</div>
                        <div style={{fontFamily:"'Courier New',monospace",fontSize:9,color:"#44445a",textTransform:"uppercase"}}>{item.type}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:700,color:"#00e5ff"}}>${item.price}</span>
                        <button onClick={()=>setCartItems(p=>p.filter((_,j)=>j!==i))} style={{background:"transparent",border:"none",color:"#2a2a3f",fontSize:14,cursor:"pointer",padding:"0 4px",lineHeight:1,transition:"color 0.2s"}}>×</button>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:12,padding:"10px 0",borderTop:"1px solid #2a2a3f",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontFamily:"'Courier New',monospace",fontSize:10,color:"#44445a",letterSpacing:"0.06em"}}>TOTAL ESTIMATE</span>
                    <span style={{fontFamily:"'Courier New',monospace",fontSize:16,fontWeight:700,color:"#00e5ff"}}>${cartItems.reduce((s,i)=>s+i.price,0).toFixed(2)}</span>
                  </div>
                  <div style={{marginTop:4,fontFamily:"'Courier New',monospace",fontSize:9,color:"#2a2a3f"}}>* Prices are approximate estimates</div>
                  <button onClick={()=>{
                    const list=cartItems.map(i=>i.name).join(", ");
                    setTab("project");
                    setTimeout(()=>setProjInput("Build a project using: "+list),100);
                  }} style={{marginTop:12,width:"100%",padding:"9px",background:"linear-gradient(135deg,#00e5ff,#7c3aed)",border:"none",color:"#0a0a0f",fontFamily:"'Courier New',monospace",fontSize:10,cursor:"pointer",borderRadius:2,letterSpacing:"0.06em"}}>
                    ⚡ BUILD PROJECT WITH THESE PARTS
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

        {/* end robotics wrapper */}
        )}

      </div>{/* end main content */}

      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.97)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e1e2e;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#2a2a3f}
        *{box-sizing:border-box}
        input:focus,textarea:focus{border-color:#00e5ff !important;box-shadow:0 0 0 2px rgba(0,229,255,0.1)}
        button:active{transform:scale(0.97)}
        textarea{caret-color:#00e5ff}
      `}</style>
    </div>
  );
}
