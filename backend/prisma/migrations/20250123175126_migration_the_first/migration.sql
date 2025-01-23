-- CreateTable
CREATE TABLE "business_hour" (
    "business_hour_id" SERIAL NOT NULL,
    "place_id" VARCHAR(255) NOT NULL,
    "business_hour" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "day" VARCHAR(10),

    CONSTRAINT "business_hour_pkey" PRIMARY KEY ("business_hour_id")
);

-- CreateTable
CREATE TABLE "list_to_go" (
    "list_to_go_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "place_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_to_go_pkey" PRIMARY KEY ("list_to_go_id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" SERIAL NOT NULL,
    "place_id" VARCHAR(255),
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(255),
    "lat" VARCHAR(255),
    "lng" VARCHAR(255),
    "rating" VARCHAR(50),
    "photo" VARCHAR(255),
    "price_level" VARCHAR(255),
    "website_uri" TEXT,
    "address" TEXT,
    "business_status" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_list" (
    "place_list_id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "place_id" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "place_list_pkey" PRIMARY KEY ("place_list_id")
);

-- CreateTable
CREATE TABLE "plan" (
    "plan_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "preference" (
    "preference_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "preference" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preference_pkey" PRIMARY KEY ("preference_id")
);

-- CreateTable
CREATE TABLE "review" (
    "review_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "place_id" VARCHAR(255) NOT NULL,
    "rating" INTEGER,
    "comment" VARCHAR(1000),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "tag" (
    "tag_id" SERIAL NOT NULL,
    "place_id" VARCHAR(255) NOT NULL,
    "tag_name" VARCHAR(255),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "place_place_id_key" ON "place"("place_id");

-- AddForeignKey
ALTER TABLE "business_hour" ADD CONSTRAINT "business_hour_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "list_to_go" ADD CONSTRAINT "list_to_go_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "list_to_go" ADD CONSTRAINT "list_to_go_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "place_list" ADD CONSTRAINT "place_list_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "place_list" ADD CONSTRAINT "place_list_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plan"("plan_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "plan" ADD CONSTRAINT "plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preference" ADD CONSTRAINT "preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "place"("place_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
