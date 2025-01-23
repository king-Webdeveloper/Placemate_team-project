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

# 9. ตรวจสอบการใช้งาน
npm run dev

# 10. Install Swagger
npm install swagger-ui-express swagger-jsdoc

# 11. Install bcrypt
npm install bcrypt

# 12. Install jwtToken
npm install jsonwebtoken


