SET SEARCH_PATH TO ga_app;

DROP TABLE IF EXISTS faultImage;
DROP TABLE IF EXISTS fault;
DROP TABLE IF EXISTS journey;
DROP TABLE IF EXISTS carriage;
DROP TABLE IF EXISTS carriageClass;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS station;

CREATE TABLE carriageClass(
	carriageClass VARCHAR(2),
	carriageLetter CHAR,
	numberOfSeats SMALLINT,
    toilet BOOLEAN,
	CONSTRAINT carriageClass_pk PRIMARY KEY (carriageClass)
);

CREATE TABLE carriage(
    carriageNo INTEGER,
    carriageClass VARCHAR(2),	
    CONSTRAINT carriage_pk PRIMARY KEY (carriageNo),
    CONSTRAINT carriage_fk FOREIGN KEY (carriageClass) REFERENCES carriageClass
);
-- carriage type: I = intercity, R = rural 
-- toilet and bike rack determine whether these options will be displayed as fault categories
-- carriage type determines what location options will be displayed if this is neccessary
-- numberOfSeats determines the number of buttons needed when selecting seat number if neccessary
-- carriage letter may be used to identify the carriage if they don't know the carriage number

CREATE TABLE staff(
    staffID INTEGER,
    fName VARCHAR(20),
    sName VARCHAR(20),
    dob DATE,
	CONSTRAINT staff_pk PRIMARY KEY (staffID)
);
-- information to verify staff ID at login (add some dummy data for demo)
-- name and dob allows staff to login if they don't know their staff ID

CREATE TABLE fault(
faultNo INTEGER,
carriageNo INTEGER,
category VARCHAR(100),
seatNo SMALLINT,
carriageLocation VARCHAR(10),
faultDesc VARCHAR(1000),
staffID INTEGER,
dateReported  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT fault_pk PRIMARY KEY (faultNo),
CONSTRAINT fault_fk1 FOREIGN KEY (carriageNo) REFERENCES carriage,
CONSTRAINT fault_pk2 FOREIGN KEY (staffID) REFERENCES staff
);
-- this is assuming carriage will always be obtained, but might need to add another table if we could only get the train 
-- (ie a list of carriages) if they only know where the train was and at what time (ie on a rural train where the carriages don't have letters)

CREATE TABLE faultImage(
    faultNo INTEGER,
    faultImage VARCHAR(20),
    CONSTRAINT faultImage_pk PRIMARY KEY (faultImage),
    CONSTRAINT faultImage_fk FOREIGN KEY (faultNo) REFERENCES FAULT
);
-- seperate table as 1 fault may have more than 1 image
-- need to work out how we will store images

CREATE TABLE station(
    stationCode VARCHAR(3),
    stationName VARCHAR(50),
    CONSTRAINT station_pk PRIMARY KEY (stationCode)
);
-- stations have unique 3 letter codes eg norwich = NRW

CREATE TABLE journey(
    carriageNo INTEGER,
    journeyDate DATE,
    departureTime TIME,
    arrivalTime TIME,
    departureStation VARCHAR(3),
    arrivalStation VARCHAR(3),
    CONSTRAINT journey_pk PRIMARY KEY (carriageNo,journeyDate,departureTime),
    CONSTRAINT journey_fk1 FOREIGN KEY (departureStation) REFERENCES station,
    CONSTRAINT journey_fk2 FOREIGN KEY (arrivalStation) REFERENCES station,
    CONSTRAINT journey_fk3 FOREIGN KEY (carriageNo) REFERENCES carriage
);
-- information to identify a train if they don't know the carriage number