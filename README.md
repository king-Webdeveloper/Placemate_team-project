# Placemate_team-project
PlaceMate WebApplication สำหรับการแนะนำสถานที่ท่องเที่ยวด้วย

# create and setting backend (23/01/2025)

# -1. create backend folder

# 0. go to backend folder
cd backend

# 0.1. create env file
cp .env_example .env

# 1. create backend folder and create package.json
npm init -y

# 2. สร้าง Dependencies (ตัวกลางที่เชื่อมต่อ backend กับ database)
npm install express prisma @prisma/client body-parser cors
npm install --save-dev nodemon

# 3. ติดตั้งตัว Prisma setting
npx prisma init

# 4. ไปที่ไฟล์ .env เพื่อเปลี่ยนรหัสผ่านและ localhost ที่ตั้งค่าไว้

# 5. Get data from database using (you can check in prisma/schema.prisma file)
npx prisma db pull

# 6. สร้าง Prisma Client
npx prisma generate

# 7. สร้างไฟล์ index.js ในโฟลเดอร์ backend

# 8. เปลี่ยนชุดคำสั่ง scripts ใน package.json
"scripts": {
    "dev": "nodemon index.js"
  },

# 9. Install Swagger
npm install swagger-ui-express swagger-jsdoc

# 10. Install bcrypt
npm install bcrypt

# 11. Install jwtToken
npm install jsonwebtoken

# 12. ตรวจสอบการใช้งาน
npm run dev

# create and setting frontend (25/01/2025)

# 1. สร้าง react app frontend (ไม่ต้องทำ)
npx create-react-app frontend

# 2. ติดตั้ง Axios (library ตัวหนึ่งของ JavaScript, TypeScript ที่ใช้ในการจัดการกับ API ด้วยวิธี HTTP methods)
npm install axios

# 3. ติดตั้ง web vitals (library ของ react เพื่อบันทึกประสบการณ์ของผู้ใช้ในเว็บเพจ)
npm i web-vitals --save-dev

# 4
npm install react-router-dom

# เริ่มต้น react frontend (เข้า cd frontend ก่อนการทำงาน)
npm start

# Create Authentication System

# 1.ติดตั้ง cookie-parser ใน Express (backend)
npm install cookie-parser

# To make web app can access location on mobile

# 1. install Chocolatey:
open cmd as administrator and run:
"
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
"

# 2. install mkcert
choco install mkcert -y

# 3. create certificate
mkcert <IP ADDRESS> //"e.g. mkcert 192.168.1.3"





# เพิ่มข้อมูลลงใน schema prisma (backend) ส่วนของ plan

# 0.อันดับแรกสุดให้เพิ่มข้อมูลลงใน database ก่อน (Postgres)
   Name                   Data type                   Length/Precision     
  start_time     timestamp with out timezone                 6  
  end_time       timestamp with out timezone                 6

# 1.เข้าไปใน schema ไปตรงส่วน model plan และทำการเพิ่มตามนี้
  start_time DateTime?    @db.Timestamp(6)
  end_time   DateTime?    @db.Timestamp(6)

# 2.ใช้ คำสั่ง npx prisma migrate status เพื่อเช็คว่า prisma มีการ appile หรือยัง (ปกติต้องขึ้นว่ายังนะ กูคิดว่าน่าจะเป็นทุกคน)

# 3.หลังจากขึ้นแล้วให้ใช้คำสั่ง npx prisma migrate resolve --applied "ชื่อที่ migration" (แจ้งให้ prisma รู้ว่า migration ถูกใช้งานแล้ว)

# 4.ใช้คำสั่ง npx prisma db push เพื่ออัปเดตโครงสร้าง Database หลังจากนั้นให้รัสตาร์ทโปรแกรมและเปิดใหม่
