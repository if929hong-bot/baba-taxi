-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "fleets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetCode" TEXT NOT NULL,
    "fleetName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suspendedAt" DATETIME,
    "suspendReason" TEXT
);

-- CreateTable
CREATE TABLE "fleet_managers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    CONSTRAINT "fleet_managers_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fleet_managers_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "super_admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fleet_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetId" TEXT NOT NULL,
    "baseFare" INTEGER NOT NULL DEFAULT 85,
    "perKmRate" REAL NOT NULL DEFAULT 20.0,
    "perMinRate" REAL NOT NULL DEFAULT 5.0,
    "minFare" INTEGER NOT NULL DEFAULT 100,
    "nightSurcharge" INTEGER DEFAULT 20,
    "nightStart" TEXT DEFAULT '23:00',
    "nightEnd" TEXT DEFAULT '06:00',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "fleet_settings_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bank_info" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "bankName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bank_info_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "super_admins" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmedBy" TEXT,
    "confirmedAt" DATETIME,
    "remarks" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rent_payments_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rent_payments_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES "super_admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fleetId" TEXT NOT NULL,
    "driverCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "carBrand" TEXT NOT NULL,
    "carModel" TEXT NOT NULL,
    "carYear" INTEGER NOT NULL,
    "carColor" TEXT NOT NULL,
    "hasInsurance" BOOLEAN NOT NULL DEFAULT false,
    "experience" TEXT,
    "currentJob" TEXT,
    "selfScore" INTEGER,
    "criminalRecord" TEXT DEFAULT '無',
    "driverLicenseUrl" TEXT,
    "carPhotosUrls" TEXT NOT NULL,
    "policeCertificateUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "onlineStatus" TEXT NOT NULL DEFAULT 'offline',
    "lastLatitude" REAL,
    "lastLongitude" REAL,
    "lastLocationUpdate" DATETIME,
    "rating" REAL NOT NULL DEFAULT 0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "totalIncome" INTEGER NOT NULL DEFAULT 0,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    CONSTRAINT "drivers_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "driver_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "driver_locations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "totalTrips" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "driverId" TEXT,
    "passengerId" TEXT,
    "passengerPhone" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" REAL,
    "pickupLng" REAL,
    "dropoffAddress" TEXT,
    "dropoffLat" REAL,
    "dropoffLng" REAL,
    "estimatedFare" INTEGER,
    "actualFare" INTEGER,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedTime" DATETIME,
    "pickedUpTime" DATETIME,
    "completedTime" DATETIME,
    "cancelledTime" DATETIME,
    "distanceKm" REAL,
    "durationMin" INTEGER,
    "note" TEXT,
    CONSTRAINT "orders_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "fleets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_trackings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "driverLat" REAL NOT NULL,
    "driverLng" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "order_trackings_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_phone_key" ON "super_admins"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "fleets_fleetCode_key" ON "fleets"("fleetCode");

-- CreateIndex
CREATE UNIQUE INDEX "fleets_fleetName_key" ON "fleets"("fleetName");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_managers_phone_key" ON "fleet_managers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_managers_email_key" ON "fleet_managers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_settings_fleetId_key" ON "fleet_settings"("fleetId");

-- CreateIndex
CREATE UNIQUE INDEX "rent_payments_fleetId_month_key" ON "rent_payments"("fleetId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driverCode_key" ON "drivers"("driverCode");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_phone_key" ON "drivers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_licensePlate_key" ON "drivers"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "driver_locations_driverId_key" ON "driver_locations"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_phone_key" ON "passengers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "order_trackings_orderId_key" ON "order_trackings"("orderId");
