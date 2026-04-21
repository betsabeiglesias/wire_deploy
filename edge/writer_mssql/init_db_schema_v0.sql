CREATE DATABASE TS;
GO

-- ALTER DATABASE TS SET RECOVERY SIMPLE;
-- GO

USE TS;
GO

-- ============================================================================
-- TELEMETRY HISTORY (append-only, time series)
-- ============================================================================
CREATE TABLE telemetry_history (
    id BIGINT IDENTITY(1,1) NOT NULL,

    [timestamp] DATETIME2 NOT NULL,
    equipment_id VARCHAR(100) NOT NULL,
    variable VARCHAR(100) NOT NULL,

    -- Modelo tipado (solo uno permitido)
    value_float FLOAT NULL,
    value_int BIGINT NULL,
    value_string NVARCHAR(255) NULL,
    value_bool BIT NULL,

    datatype VARCHAR(20),
    unit VARCHAR(50),
    quality VARCHAR(20),
    batch_id VARCHAR(50),

    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_telemetry_history 
        PRIMARY KEY CLUSTERED (id),

    -- Solo un valor puede estar informado
    CONSTRAINT CHK_one_value_only CHECK (
        (CASE WHEN value_float IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN value_int IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN value_string IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN value_bool IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);
GO

-- Índice crítico para queries TS (dashboard, latest, históricos)
CREATE INDEX idx_ts_eq_var_time 
ON telemetry_history (equipment_id, variable, [timestamp] DESC);
GO

-- Índice por timestamp (queries globales)
CREATE INDEX idx_ts_time 
ON telemetry_history ([timestamp]);
GO

SELECT '✅ Table telemetry_history created' AS Result;
GO

-- ============================================================================
-- TELEMETRY LATEST (VIEW - MVP)
-- ============================================================================
CREATE VIEW telemetry_latest AS 
WITH ranked AS (
    SELECT 
        equipment_id,
        variable,
        value_float,
        value_int,
        value_string,
        value_bool,
        [timestamp],
        datatype,
        unit,
        quality,
        ROW_NUMBER() OVER (
            PARTITION BY equipment_id, variable 
            ORDER BY [timestamp] DESC
        ) AS rn
    FROM telemetry_history
)
SELECT *
FROM ranked
WHERE rn = 1;
GO

SELECT '✅ View telemetry_latest created' AS Result;
GO

-- ============================================================================
-- RAW MQTT MESSAGES (auditoría / replay)
-- ============================================================================
CREATE TABLE mqtt_raw_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,

    received_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    topic VARCHAR(500) NOT NULL,
    payload NVARCHAR(MAX) NOT NULL,

    client VARCHAR(50),
    equipment_id VARCHAR(100),
    batch_id VARCHAR(50),

    parsed_at DATETIME2,
    parse_error NVARCHAR(MAX),

    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX idx_mqtt_raw_received 
ON mqtt_raw_messages(received_at);
GO

SELECT '✅ Table mqtt_raw_messages created' AS Result;
GO

-- ============================================================================
-- ETL STATE (estado incremental)
-- ============================================================================
CREATE TABLE etl_state (
    id INT PRIMARY KEY DEFAULT 1,

    last_timestamp DATETIME2 NOT NULL DEFAULT '1970-01-01 00:00:00',
    last_batch_id VARCHAR(50),

    records_processed BIGINT DEFAULT 0,
    last_run_duration_seconds DECIMAL(10,2),
    last_run_status VARCHAR(20),
    error_message NVARCHAR(MAX),

    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CHK_etl_state_single_row CHECK (id = 1)
);
GO

-- Inicialización
INSERT INTO etl_state (id, last_timestamp, last_run_status) 
VALUES (1, '1970-01-01 00:00:00', 'initialized');
GO

SELECT '✅ Table etl_state created and initialized' AS Result;
GO

-- ============================================================================
-- ETL METRICS (observabilidad)
-- ============================================================================
CREATE TABLE etl_metrics (
    id INT IDENTITY(1,1) PRIMARY KEY,

    batch_id VARCHAR(50) NOT NULL,

    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,

    records_processed INT DEFAULT 0,
    duration_seconds DECIMAL(10,2),

    status VARCHAR(20) NOT NULL,
    error_message NVARCHAR(MAX),

    created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX idx_etl_metrics_batch_id 
ON etl_metrics(batch_id);

CREATE INDEX idx_etl_metrics_start_time 
ON etl_metrics(start_time);

CREATE INDEX idx_etl_metrics_status 
ON etl_metrics(status);
GO

SELECT '✅ Table etl_metrics created' AS Result;
GO

-- ============================================================================
-- VERIFICATION
-- ============================================================================
PRINT '';
PRINT '════════════════════════════════════════════════════════════════';
PRINT 'Database schema created successfully!';
PRINT '════════════════════════════════════════════════════════════════';
PRINT '';