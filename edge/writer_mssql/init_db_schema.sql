CREATE DATABASE textil;
GO

ALTER DATABASE textil SET RECOVERY SIMPLE;
GO

USE textil;
GO

-- ============================================================================
-- TELEMETRY HISTORY (todos los datos históricos)
-- ============================================================================
CREATE TABLE telemetry_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    [timestamp] DATETIME2 NOT NULL,
    equipment_id VARCHAR(100) NOT NULL,
    variable VARCHAR(100) NOT NULL,

    -- Modelo tipado
    value_float FLOAT NULL,
    value_int BIGINT NULL,
    value_string NVARCHAR(255) NULL,
    value_bool BIT NULL,

    datatype VARCHAR(20),
    unit VARCHAR(50),
    quality VARCHAR(20),
    batch_id VARCHAR(50),

    created_at DATETIME2 DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_telemetry_id 
        PRIMARY KEY CLUSTERED (id)
);

-- CREATE INDEX idx_telemetry_timestamp ON telemetry_history([timestamp]);
-- CREATE INDEX idx_telemetry_equipment ON telemetry_history(equipment_id);
-- CREATE INDEX idx_telemetry_variable ON telemetry_history(variable);

-- CREATE UNIQUE INDEX idx_telemetry_unique 
-- ON telemetry_history([timestamp], equipment_id, variable);

SELECT '✅ Table telemetry_history created' AS Result;
GO

-- ============================================================================
-- TELEMETRY LATEST (VIEW - últimos valores de cada variable)
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
-- RAW MQTT MESSAGES (auditoría, logs y data recovery)
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

CREATE INDEX idx_mqtt_raw_received ON mqtt_raw_messages(received_at);
-- CREATE INDEX idx_mqtt_raw_client ON mqtt_raw_messages(client);
-- CREATE INDEX idx_mqtt_raw_equipment ON mqtt_raw_messages(equipment_id);
-- CREATE INDEX idx_mqtt_raw_parsed ON mqtt_raw_messages(parsed_at);
-- CREATE INDEX idx_mqtt_raw_batch ON mqtt_raw_messages(batch_id);

SELECT '✅ Table mqtt_raw_messages created' AS Result;
GO

-- ============================================================================
-- ETL STATE (estado del proceso ETL)
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

-- Insertar registro inicial (época inicial para primera ejecución)
INSERT INTO etl_state (id, last_timestamp, last_run_status) 
VALUES (1, '1970-01-01 00:00:00', 'initialized');

SELECT '✅ Table etl_state created and initialized' AS Result;
GO

-- ============================================================================
-- ETL METRICS (historial de ejecuciones del ETL)
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

CREATE INDEX idx_etl_metrics_batch_id ON etl_metrics(batch_id);
CREATE INDEX idx_etl_metrics_start_time ON etl_metrics(start_time);
CREATE INDEX idx_etl_metrics_status ON etl_metrics(status);

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

-- -- Tablas
-- SELECT 
--     t.name AS TableName,
--     ISNULL(SUM(p.rows), 0) AS RowCount
-- FROM sys.tables t
-- LEFT JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
-- WHERE t.name IN ('telemetry_catalog', 'telemetry_history', 'etl_state', 'etl_metrics', 'mqtt_raw_messages')
-- GROUP BY t.name
-- ORDER BY t.name;

-- -- Vistas
-- SELECT 
--     name AS ViewName,
--     create_date AS Created
-- FROM sys.views
-- WHERE name = 'telemetry_latest';

-- -- Estado inicial del ETL
-- SELECT 
--     'ETL Initial State' AS Info,
--     last_timestamp,
--     last_run_status
-- FROM etl_state;
-- GO
