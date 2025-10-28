CREATE TABLE Customer (
    customerId CHAR(36) PRIMARY KEY, -- uuid
    firstName VARCHAR(50) NOT NULL CHECK (LENGTH(firstName) >= 1), -- at least 1 char, max 50
    lastName VARCHAR(50) NOT NULL CHECK (LENGTH(lastName) >= 1),
    middleInitial CHAR(1), -- optional middle initial
    joinDate DATETIME NOT NULL DEFAULT NOW(), -- defaults to current date
    deletedAt DATETIME NULL -- soft delete (null if not deleted)
    userId CHAR(36) UNIQUE NULL -- uuid, unique foreign key to User(userId)

    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Business (
    businessId CHAR(36) PRIMARY KEY, -- uuid
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 1), -- at least 1 char, max 100
    address VARCHAR(200) NOT NULL CHECK (LENGTH(address) >= 1), -- at least 1 char, max 200
    phone CHAR(10) NOT NULL CHECK (phone REGEXP '^[0-9]{10}$'), -- exactly 10 digits
    email VARCHAR(100) UNIQUE NOT NULL, -- basic email format 
    uiDescription VARCHAR(1000) NULL, -- description for UI purposes
    type ENUM('zoo', 'retail', 'food', 'vet_clinic') NOT NULL,
    numEmployees INT NOT NULL CHECK (numEmployees >= 0 AND numEmployees <= 100000), -- between 0 and 100 thousand (this will be calculated by DBMS based on Employees table)
    createdAt DATETIME NOT NULL DEFAULT NOW(), -- defaults to current date
    deletedAt DATETIME NULL, -- soft delete (null if not deleted)
    ownerId CHAR(36) NULL -- uuid, foreign key to Employee(id)
);

CREATE TABLE Employee (
    employeeId CHAR(36) PRIMARY KEY, -- uuid
	accessLevel ENUM('worker', 'zookeeper', 'veterinarian', 'manager', 'executive', 'db_admin') NOT NULL,
	jobTitle VARCHAR(100) NOT NULL CHECK(LENGTH(jobTitle) >= 2),
    firstName VARCHAR(50) NOT NULL CHECK (LENGTH(firstName) >= 1), -- at least 1 char, max 50
    lastName VARCHAR(50) NOT NULL CHECK (LENGTH(lastName) >= 1),
    middleInitial CHAR(1) NULL,
	sex ENUM('male', 'female') NOT NULL,
	ssn CHAR(9) NOT NULL,
	hourlyWage DECIMAL(7,2) NOT NULL CHECK (hourlyWage > 0.00),
	jobDescription VARCHAR(200) NULL,
	addressPostalCode VARCHAR(11) NOT NULL,
	addressStreet VARCHAR(100) NOT NULL CHECK(LENGTH(addressStreet) > 1),
	addressCity VARCHAR(50) NOT NULL CHECK(LENGTH(addressCity) > 2),
	addressState VARCHAR(20) NULL CHECK(LENGTH(addressState) > 3),
	payInfoAccountNum VARCHAR(40) NULL CHECK(LENGTH(payInfoAccountNum) > 7),
	payInfoRoutingNum VARCHAR(20) NULL CHECK(LENGTH(payInfoRoutingNum) > 8),
	payInfoPaymentMethod ENUM('check', 'direct_deposit') NOT NULL,
	businessId CHAR(36) NOT NULL,
	hireDate DATE NOT NULL DEFAULT (CURDATE()),
	terminationDate DATE NULL,
	birthDate DATE NOT NULL,
	phone VARCHAR(20) NOT NULL CHECK(LENGTH(phone)>9),
	deletedAt DATE NULL,
	supervisorId CHAR(36) NULL,
    userId CHAR(36) UNIQUE NULL, -- uuid, unique foreign key to User(userId)

	FOREIGN KEY (businessId) REFERENCES Business(businessId) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (supervisorId) REFERENCES Employee(employeeId) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK(terminationDate IS NULL OR terminationDate > hireDate)
);

CREATE TABLE Transaction (
    transactionId CHAR(36) PRIMARY KEY, -- uuid
    description VARCHAR(1000) NULL,
    businessId CHAR(36) NOT NULL, -- uuid, foreign key to Business(id)
    amount DECIMAL(24, 2) NOT NULL CHECK (amount >= 0),
    deletedAt DATETIME NULL, -- soft delete (null if not deleted)

    FOREIGN KEY (businessId) REFERENCES Business(businessId) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Membership (
    membershipId CHAR(36) PRIMARY KEY, -- uuid
    customerId CHAR(36) UNIQUE NOT NULL, -- uuid, unique foreign key to Customer(id)
    level ENUM('individual', 'family', 'senior', 'donor') NOT NULL,
    startDate DATE NOT NULL DEFAULT (CURDATE()), -- defaults to current date
    expireDate DATE NOT NULL, -- must be after startDate
    autoRenew BOOLEAN NOT NULL DEFAULT FALSE,
    transactionId CHAR(36) UNIQUE NOT NULL, -- uuid, foreign key to Transaction(id)

    FOREIGN KEY (customerId) REFERENCES Customer(customerId) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (transactionId) REFERENCES Transaction(transactionId) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (expireDate > startDate)
);

CREATE TABLE Item (
    itemId CHAR(36) PRIMARY KEY, -- uuid
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 1), -- at least 1 char, max 100
    description VARCHAR(1000) NULL, -- optional description
    price DECIMAL(24, 2) NOT NULL CHECK (price >= 0),
    uiPhotoUrl VARCHAR(200) NULL CHECK (uiPhotoUrl LIKE 'http%'), -- optional photo URL for UI purposes
    deletedAt DATETIME NULL, -- soft delete (null if not deleted)
    businessId CHAR(36) NOT NULL, -- uuid, foreign key to Business(id)

    FOREIGN KEY (businessId) REFERENCES Business(businessId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PurchasedItem (
    purchasedItemId CHAR(36) PRIMARY KEY, -- uuid
    customerId CHAR(36) NULL, -- uuid, foreign key to Customer(id)
    transactionId CHAR(36) NULL, -- uuid, foreign key to Transaction(id)
    itemId CHAR(36) NULL, -- uuid, foreign key to Item(id)

    FOREIGN KEY (customerId) REFERENCES Customer(customerId) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (transactionId) REFERENCES Transaction(transactionId) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (itemId) REFERENCES Item(itemId) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE BusinessHoursDay (
    businessHoursDayId CHAR(36) PRIMARY KEY, -- uuid
    businessId CHAR(36) NOT NULL, -- uuid, foreign key to Business(id)
    dayOfWeek ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    openTime TIME NOT NULL, -- time only (no date)
    closeTime TIME NOT NULL, -- must be after openTime

    FOREIGN KEY (businessId) REFERENCES Business(businessId) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (closeTime > openTime)
);

CREATE TABLE Attraction (
    attractionId CHAR(36) PRIMARY KEY, -- uuid
    name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 1), -- at least 1 char, max 100
    uiDescription VARCHAR(1000) NULL, -- description for UI purposes
    startDate DATE NULL DEFAULT (CURDATE()), -- defaults to current date if not provided
    endDate DATE NULL, -- must be after startDate or null if ongoing
    location VARCHAR(200) NOT NULL CHECK (LENGTH(location) >= 1), -- at least 1 char, max 200
    uiImage VARCHAR(200) NULL, -- image URL for UI
    deletedAt DATETIME NULL, -- soft delete (null if not deleted)

    CHECK (endDate IS NULL OR endDate > startDate)
);

CREATE TABLE AttractionHoursDay (
    attractionHoursDayId CHAR(36) PRIMARY KEY, -- uuid
    attractionId CHAR(36) NOT NULL, -- uuid, foreign key to Attraction(id)
    dayOfWeek ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    openTime TIME NOT NULL, -- time only (no date)
    closeTime TIME NOT NULL, -- must be after openTime

    FOREIGN KEY (attractionId) REFERENCES Attraction(attractionId) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (closeTime > openTime)
);

CREATE TABLE AttractionPhoto (
    AttractionPhotoId CHAR(36) PRIMARY KEY, -- uuid
    attractionId CHAR(36) NOT NULL, -- uuid, foreign key to Attraction(id)
    url VARCHAR(200) NOT NULL CHECK (url LIKE 'http%'), -- basic URL format check
    subtitle VARCHAR(500) NULL, -- optional subtitle for photo

    FOREIGN KEY (attractionId) REFERENCES Attraction(attractionId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Shift (
	shiftId CHAR(36) PRIMARY KEY, -- uuid
	start DATETIME NOT NULL,
	end DATETIME NOT NULL,
	attractionId CHAR(36) NULL, -- uuid, optional FK
	deletedAt DATETIME NULL,
	
	FOREIGN KEY (attractionId) REFERENCES Attraction(attractionId) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK (end > start)
);

CREATE TABLE EmployeeTakesShift(
    shiftTakenId CHAR(36) PRIMARY KEY,
    shiftId CHAR(36) NOT NULL,
	employeeId CHAR(36) NOT NULL,
	totalHours DECIMAL(4,2) NOT NULL CHECK(totalHours > 0.00 AND totalHours < 16.00),

    FOREIGN KEY (shiftId) REFERENCES Shift(shiftId) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (employeeId) REFERENCES Employee(employeeId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE EmployeeClockTime(
	clockTimeId CHAR(36) PRIMARY KEY,
	shiftId CHAR(36) NOT NULL,
	startTime DATETIME NOT NULL,
	endTime DATETIME NOT NULL,

	FOREIGN KEY (shiftId) REFERENCES Shift(shiftId) ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK(endTime > startTime)
);

CREATE TABLE Habitat(
	habitatId CHAR(36) PRIMARY KEY,
	name VARCHAR(100) NOT NULL CHECK(LENGTH(name) > 3),
	description VARCHAR(500) NOT NULL,
	deletedAt DATE NULL
);

CREATE TABLE HabitatPhoto(
	habitatPhotoId CHAR(36) PRIMARY KEY,
	habitatId CHAR(36) NOT NULL,
	url VARCHAR(255) NOT NULL CHECK(url LIKE 'http%'),
	subtitle VARCHAR(500) NULL,

	FOREIGN KEY (habitatId) REFERENCES Habitat(habitatId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Diet (
    dietId CHAR(36) PRIMARY KEY, -- uuid
    specialNotes VARCHAR(200) NULL CHECK (specialNotes IS NULL OR LENGTH(specialNotes) >= 1),
    deletedAt DATETIME NULL
);

CREATE TABLE DietScheduleDay (
    dietScheduleDayId CHAR(36) PRIMARY KEY, -- uuid
    dietId CHAR(36) NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    feedTime TIME NOT NULL, -- HH:mm format
    food VARCHAR(100) NOT NULL CHECK (LENGTH(food) >= 1),

    FOREIGN KEY (dietId) REFERENCES Diet(dietId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Animal (
    animalId CHAR(36) PRIMARY KEY, -- uuid
    firstName VARCHAR(50) NOT NULL CHECK (LENGTH(firstName) >= 1), -- at least 1 char, max 30
    lastName VARCHAR(50) NULL CHECK (lastName IS NULL OR LENGTH(lastName) >= 1), -- at least 1 char, max 30
    commonName VARCHAR(100) NOT NULL CHECK (LENGTH(commonName) >= 1), -- at least 1 char, max 100
    species VARCHAR(100) NOT NULL CHECK (LENGTH(species) >= 1), -- at least 1 char, max 100
    genus VARCHAR(50) NOT NULL CHECK (LENGTH(genus) >= 1), -- at least 1 char, max 50
    birthDate DATE NOT NULL,
    deathDate DATE NULL,
    importedFrom VARCHAR(100) NULL CHECK (importedFrom IS NULL OR LENGTH(importedFrom) >= 1),
    importDate DATE NULL,
    sex ENUM('male', 'female') NOT NULL,
    behavior VARCHAR(200) NULL,
    habitatId CHAR(36) NOT NULL,
    dietId CHAR(36) NOT NULL,
    deletedAt DATETIME NULL,

    FOREIGN KEY (habitatId) REFERENCES Habitat(habitatId) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (dietId) REFERENCES Diet(dietId) ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK (deathDate IS NULL OR deathDate > birthDate)
);

CREATE TABLE TakesCareOf(
	employeeId CHAR(36) NOT NULL,
	animalId CHAR(36) NOT NULL,

	PRIMARY KEY (employeeId, animalId),
	FOREIGN KEY (employeeId) REFERENCES Employee(employeeId) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (animalId) REFERENCES Animal(animalId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE MedicalRecord (
    medicalRecordId CHAR(36) PRIMARY KEY, -- uuid
    veterinarianNotes VARCHAR(500) NULL, -- optional, no length restriction beyond 500 for practicality
    reasonForVisit VARCHAR(200) NOT NULL CHECK (LENGTH(reasonForVisit) > 0),
    animalId CHAR(36) NULL,
    visitDate DATETIME NOT NULL,
    checkoutDate DATETIME NULL,
    deletedAt DATETIME NULL,

    FOREIGN KEY (animalId) REFERENCES Animal(animalId) ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK (checkoutDate IS NULL OR checkoutDate > visitDate)
);

CREATE TABLE PrescribedMedication (
    prescribedMedicationId CHAR(36) PRIMARY KEY, -- uuid
    medicalRecordId CHAR(36) NOT NULL,
    medication VARCHAR(200) NOT NULL CHECK (LENGTH(medication) > 0),

    FOREIGN KEY (medicalRecordId) REFERENCES MedicalRecord(medicalRecordId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE AssignedVeterinarian (
    veterinarianId CHAR(36) PRIMARY KEY, -- uuid
    medicalRecordId CHAR(36) NOT NULL,
    vetName VARCHAR(100) NOT NULL CHECK (LENGTH(vetName) >= 2),
    vetEmail VARCHAR(100) NOT NULL CHECK (LENGTH(vetEmail) >= 3),
    vetOffice VARCHAR(100) NOT NULL CHECK (LENGTH(vetOffice) > 0),

    FOREIGN KEY (medicalRecordId) REFERENCES MedicalRecord(medicalRecordId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Expense (
    expenseId CHAR(36) PRIMARY KEY, -- uuid
    expenseDescription VARCHAR(100) NOT NULL CHECK (LENGTH(expenseDescription) >= 1), -- max 100 chars
    cost DECIMAL(24,2) NOT NULL CHECK (cost > 0.00), -- must be > 0, 2 decimals
    purchaseDate DATETIME NOT NULL, -- stored as full datetime (MM:DD:YYYY:HH:mm)
    businessId CHAR(36) NOT NULL,
    deletedAt DATETIME NULL,

    FOREIGN KEY (businessId) REFERENCES Business(businessId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE AuthSession (
    id CHAR(36) PRIMARY KEY, -- uuid
    customerId CHAR(36) NULL, -- uuid, foreign key to Customer(id)
    employeeId CHAR(36) NULL, -- uuid, foreign key to Employee(id)
    expiresAt DATETIME NOT NULL, -- session expiration datetime
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP -- defaults to current timestamp
);

ALTER TABLE Business
ADD CONSTRAINT fk_business_owner
FOREIGN KEY (ownerId) REFERENCES Employee(employeeId) ON DELETE SET NULL ON UPDATE CASCADE;