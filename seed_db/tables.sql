CREATE TABLE classes(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    sections VARCHAR(50)
);

CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE sections(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE leave_policies(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_editable BOOLEAN DEFAULT true
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    last_login TIMESTAMP DEFAULT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT NULL,
    leave_policy_id INTEGER REFERENCES leave_policies(id) DEFAULT NULL,
    is_active BOOLEAN DEFAULT false,
    reporter_id INTEGER DEFAULT NULL,
    status_last_reviewed_dt TIMESTAMP DEFAULT NULL,
    status_last_reviewer_id INTEGER REFERENCES users(id) DEFAULT NULL,
    is_email_verified BOOLEAN DEFAULT false
);

CREATE TABLE user_profiles(
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    gender VARCHAR(10) DEFAULT NULL,
    marital_status VARCHAR(50) DEFAULT NULL,
    join_dt DATE DEFAULT NULL,
    qualification VARCHAR(100) DEFAULT NULL,
    experience VARCHAR(100) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    class_name VARCHAR(50) REFERENCES classes(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
        DEFAULT NULL,
    section_name VARCHAR(50) REFERENCES sections(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
        DEFAULT NULL,
    roll INTEGER DEFAULT NULL,
    department_id INTEGER REFERENCES departments(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
        DEFAULT NULL,
    admission_dt DATE DEFAULT NULL,
    father_name VARCHAR(50) DEFAULT NULL,
    father_phone VARCHAR(20) DEFAULT NULL,
    mother_name VARCHAR(50) DEFAULT NULL,
    mother_phone VARCHAR(20) DEFAULT NULL,
    guardian_name VARCHAR(50) DEFAULT NULL,
    guardian_phone VARCHAR(20) DEFAULT NULL,
    emergency_phone VARCHAR(20) DEFAULT NULL,
    relation_of_guardian VARCHAR(30) DEFAULT NULL,
    current_address VARCHAR(50) DEFAULT NULL,
    permanent_address VARCHAR(50) DEFAULT NULL,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT NULL
);

CREATE TABLE access_controls(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(100) DEFAULT NULL,
    icon VARCHAR(100) DEFAULT NULL,
    parent_path VARCHAR(100) DEFAULT NULL,
    hierarchy_id INTEGER DEFAULT NULL,
    type VARCHAR(50) DEFAULT NULL,
    method VARCHAR(10) DEFAULT NULL,
    UNIQUE(path, method)
);

CREATE TABLE leave_status(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE user_leaves(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) NOT NULL,
    leave_policy_id INTEGER REFERENCES leave_policies(id) DEFAULT NULL,
    from_dt DATE NOT NULL,
    to_dt DATE NOT NULL,
    note VARCHAR(100),
    submitted_dt TIMESTAMP DEFAULT NULL,
    updated_dt TIMESTAMP DEFAULT NULL,
    approved_dt TIMESTAMP DEFAULT NULL,
    approver_id INTEGER REFERENCES users(id),
    status INTEGER REFERENCES leave_status(id)
);

CREATE TABLE class_teachers(
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id),
    class_name VARCHAR(50) REFERENCES classes(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    section_name VARCHAR(30) REFERENCES sections(name)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE notice_status(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    alias VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE notices(
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(400) NOT NULL,
    status INTEGER REFERENCES notice_status(id) DEFAULT NULL,
    created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP DEFAULT NULL,
    reviewed_dt TIMESTAMP DEFAULT NULL,
    reviewer_id INTEGER REFERENCES users(id) DEFAULT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    recipient_role_id INTEGER DEFAULT NULL,
    recipient_first_field VARCHAR(20) DEFAULT NULL
);

CREATE TABLE user_refresh_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE permissions(
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id),
    access_control_id INTEGER REFERENCES access_controls(id),
    type VARCHAR(20) DEFAULT NULL,
    UNIQUE(role_id, access_control_id)
);

CREATE TABLE notice_recipient_types(
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id),
    primary_dependent_name VARCHAR(100) DEFAULT NULL,
    primary_dependent_select VARCHAR(100) DEFAULT NULL
);

CREATE TABLE user_leave_policy (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) DEFAULT NULL,
    leave_policy_id INTEGER REFERENCES leave_policies(id) DEFAULT NULL,
    UNIQUE (user_id, leave_policy_id)
);


-- functions
DROP FUNCTION IF EXISTS staff_add_update(JSONB);
CREATE OR REPLACE FUNCTION public.staff_add_update(data jsonb)
RETURNS TABLE("userId" INTEGER, status boolean, message TEXT, description TEXT) 
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
    _operationType VARCHAR(10);

    _userId INTEGER;
    _name TEXT;
    _role INTEGER;
    _gender TEXT;
    _maritalStatus TEXT;
    _phone TEXT;
    _email TEXT;
    _dob DATE;
    _joinDate DATE;
    _qualification TEXT;
    _experience TEXT;
    _currentAddress TEXT;
    _permanentAddress TEXT;
    _fatherName TEXT;
    _motherName TEXT;
    _emergencyPhone TEXT;
    _systemAccess BOOLEAN;
    _reporterId INTEGER;
BEGIN
    _userId := COALESCE((data ->>'userId')::INTEGER, NULL);
    _name := COALESCE(data->>'name', NULL);
    _role := COALESCE((data->>'role')::INTEGER, NULL);
    _gender := COALESCE(data->>'gender', NULL);
    _maritalStatus := COALESCE(data->>'maritalStatus', NULL);
    _phone := COALESCE(data->>'phone', NULL);
    _email := COALESCE(data->>'email', NULL);
    _dob := COALESCE((data->>'dob')::DATE, NULL);
    _joinDate := COALESCE((data->>'joinDate')::DATE, NULL);
    _qualification := COALESCE(data->>'qualification', NULL);
    _experience := COALESCE(data->>'experience', NULL);
    _currentAddress := COALESCE(data->>'currentAddress', NULL);
    _permanentAddress := COALESCE(data->>'permanentAddress', NULL);
    _fatherName := COALESCE(data->>'fatherName', NULL);
    _motherName := COALESCE(data->>'motherName', NULL);
    _emergencyPhone := COALESCE(data->>'emergencyPhone', NULL);
    _systemAccess := COALESCE((data->>'systemAccess')::BOOLEAN, NULL);
    _reporterId := COALESCE((data->>'reporterId')::INTEGER, NULL);

    IF _userId IS NULL THEN
        _operationType := 'add';
    ELSE
        _operationType := 'update';
    END IF;

    IF _role = 3 THEN
        RETURN QUERY
        SELECT NULL::INTEGER, false, 'Student cannot be staff', NULL::TEXT;
        RETURN;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM users WHERE id = _userId) THEN

        IF EXISTS(SELECT 1 FROM users WHERE email = _email) THEN
        RETURN QUERY
            SELECT NULL::INTEGER, false, 'Email already exists', NULL::TEXT;
        RETURN;
        END IF;

        INSERT INTO users (name,email,role_id,created_dt,reporter_id)
        VALUES (_name,_email,_role,now(),_reporterId) RETURNING id INTO _userId;

        INSERT INTO user_profiles
        (user_id, gender, marital_status, phone,dob,join_dt,qualification,experience,current_address,permanent_address,father_name,mother_name,emergency_phone)
        VALUES
        (_userId,_gender,_maritalStatus,_phone,_dob,_joinDate,_qualification,_experience,_currentAddress,_permanentAddress,_fatherName,_motherName,_emergencyPhone);

        RETURN QUERY
            SELECT _userId, true, 'Staff added successfully', NULL;
        RETURN;
    END IF;


    --update user tables
    UPDATE users
    SET
        name = _name,
        email = _email,
        role_id = _role,
        is_active = _systemAccess,
        reporter_id = _reporterId,
        updated_dt = now()
    WHERE id = _userId;

    UPDATE user_profiles
    SET
        gender = _gender,
        marital_status = _maritalStatus,
        phone = _phone,
        dob = _dob,
        join_dt = _joinDate,
        qualification = _qualification,
        experience = _experience,
        current_address = _currentAddress,
        permanent_address = _permanentAddress, 
        father_name = _fatherName,
        mother_name = _motherName,
        emergency_phone = _emergencyPhone
    WHERE user_id = _userId;

    RETURN QUERY
        SELECT _userId, true, 'Staff updated successfully', NULL;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY
            SELECT _userId::INTEGER, false, 'Unable to ' || _operationType || ' staff', SQLERRM;
END;
$BODY$;



--student add/update
DROP FUNCTION IF EXISTS student_add_update(JSONB);
CREATE OR REPLACE FUNCTION public.student_add_update(data jsonb)
RETURNS TABLE("userId" INTEGER, status boolean, message TEXT, description TEXT) 
LANGUAGE 'plpgsql'
AS $BODY$

DECLARE
    _operationType VARCHAR(10);
    _reporterId INTEGER;

    _userId INTEGER;
    _name TEXT;
    _roleId INTEGER;
    _gender TEXT;
    _phone TEXT;
    _email TEXT;
    _dob DATE;
    _currentAddress TEXT;
    _permanentAddress TEXT;
    _fatherName TEXT;
    _fatherPhone TEXT;
    _motherName TEXT;
    _motherPhone TEXT;
    _guardianName TEXT;
    _guardianPhone TEXT;
    _relationOfGuardian TEXT;
    _systemAccess BOOLEAN;
    _className TEXT;
    _sectionName TEXT;
    _admissionDt DATE;
    _roll INTEGER;
BEGIN
    _roleId = 3;
    _userId := COALESCE((data ->>'userId')::INTEGER, NULL);
    _name := COALESCE(data->>'name', NULL);
    _gender := COALESCE(data->>'gender', NULL);
    _phone := COALESCE(data->>'phone', NULL);
    _email := COALESCE(data->>'email', NULL);
    _dob := COALESCE((data->>'dob')::DATE, NULL);
    _currentAddress := COALESCE(data->>'currentAddress', NULL);
    _permanentAddress := COALESCE(data->>'permanentAddress', NULL);
    _fatherName := COALESCE(data->>'fatherName', NULL);
    _fatherPhone := COALESCE(data->>'fatherPhone', NULL);
    _motherName := COALESCE(data->>'motherName', NULL);
    _motherPhone := COALESCE(data->>'motherPhone', NULL);
    _guardianName := COALESCE(data->>'guardianName', NULL);
    _guardianPhone := COALESCE(data->>'guardianPhone', NULL);
    _relationOfGuardian := COALESCE(data->>'relationOfGuardian', NULL);
    _systemAccess := COALESCE((data->>'systemAccess')::BOOLEAN, false); -- Add default false
    _className := COALESCE(data->>'class', NULL);
    _sectionName := COALESCE(data->>'section', NULL);
    _admissionDt := COALESCE((data->>'admissionDate')::DATE, NULL);
    _roll := COALESCE((data->>'roll')::INTEGER, NULL);

    -- Debug logging
    RAISE NOTICE 'Processing student data: name=%, email=%, roll=%, systemAccess=%', _name, _email, _roll, _systemAccess;

    IF _userId IS NULL THEN
        _operationType := 'add';
    ELSE
        _operationType := 'update';
    END IF;

    SELECT teacher_id
    FROM class_teachers
    WHERE class_name = _className AND section_name = _sectionName
    INTO _reporterId;

    IF _reporterId IS NULL THEN
        SELECT id from users WHERE role_id = 1 ORDER BY id ASC LIMIT 1 INTO _reporterId;
    END IF;

    IF NOT EXISTS(SELECT 1 FROM users WHERE id = _userId) THEN

        IF EXISTS(SELECT 1 FROM users WHERE email = _email) THEN
        RETURN QUERY
            SELECT NULL::INTEGER, false, 'Email already exists', NULL::TEXT;
        RETURN;
        END IF;

        -- Insert into users table with systemAccess
        INSERT INTO users (name,email,role_id,created_dt,reporter_id,is_active)
        VALUES (_name,_email,_roleId,now(),_reporterId,_systemAccess) RETURNING id INTO _userId;

        -- Insert into user_profiles table
        INSERT INTO user_profiles
        (user_id,gender,phone,dob,admission_dt,class_name,section_name,roll,current_address,permanent_address,father_name,father_phone,mother_name,mother_phone,guardian_name,guardian_phone,relation_of_guardian)
        VALUES
        (_userId,_gender,_phone,_dob,_admissionDt,_className,_sectionName,_roll,_currentAddress,_permanentAddress,_fatherName,_fatherPhone,_motherName,_motherPhone,_guardianName,_guardianPhone,_relationOfGuardian);

        RETURN QUERY
            SELECT _userId, true, 'Student added successfully', NULL;
        RETURN;
    END IF;


    --update user tables
    UPDATE users
    SET
        name = _name,
        email = _email,
        role_id = _roleId,
        is_active = _systemAccess,
        updated_dt = now()
    WHERE id = _userId;

    UPDATE user_profiles
    SET
        gender = _gender,
        phone = _phone,
        dob = _dob,
        admission_dt = _admissionDt,
        class_name = _className,
        section_name  =_sectionName,
        roll = _roll,
        current_address = _currentAddress,
        permanent_address = _permanentAddress, 
        father_name = _fatherName,
        father_phone = _fatherPhone,
        mother_name = _motherName,
        mother_phone = _motherPhone,
        guardian_name = _guardianName,
        guardian_phone = _guardianPhone,
        relation_of_guardian = _relationOfGuardian
    WHERE user_id = _userId;

    RETURN QUERY
        SELECT _userId, true , 'Student updated successfully', NULL;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in student_add_update: %', SQLERRM;
        RETURN QUERY
            SELECT _userId::INTEGER, false, 'Unable to ' || _operationType || ' student: ' || SQLERRM, SQLERRM;
END;
$BODY$;