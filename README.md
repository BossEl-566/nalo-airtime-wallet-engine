# Bulk Airtime & Wallet Transaction Engine

A small backend service for processing bulk airtime disbursements while maintaining wallet balance consistency.

This project was built as part of the Nalo Solutions National Service engineering practical challenge.

## Overview

The application accepts a CSV file containing airtime transactions with the following fields:

* `phone_number`
* `amount`
* `network`

Each transaction is validated and processed sequentially against a wallet balance.

Successful transactions deduct their amount from the running wallet balance. Failed transactions do not affect the wallet balance and processing continues with the remaining rows.

## Features

* CSV file upload
* Ghanaian phone number validation
* Support for local and international phone formats
* Phone number normalization
* Network validation
* Sequential wallet processing
* Insufficient-balance protection
* Duplicate transaction detection
* Persistent wallet balance using a JSON file
* Detailed success and failure reporting
* Wallet reset endpoint for testing
* Automated unit tests

## Supported Phone Number Formats

The application accepts Ghanaian phone numbers in either format:

Local:

```text
0241234567
```

International:

```text
233241234567
```

International numbers are normalized internally to the local format.

For example:

```text
233241234567
```

becomes:

```text
0241234567
```

## Supported Networks

The following networks are supported:

* MTN
* Telecel
* AT

## Technology Stack

* Node.js
* Express.js
* JavaScript
* Multer
* CSV Parser
* Node.js Test Runner
* JSON file persistence

## Project Structure

```text
nalo-airtime-engine/
│
├── data/
│   ├── sample-airtime.csv
│   └── wallet.json
│
├── src/
│   ├── routes/
│   ├── services/
│   ├── storage/
│   ├── utils/
│   ├── validators/
│   └── server.js
│
├── tests/
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/nalo-airtime-wallet-engine.git
```

Move into the project directory:

```bash
cd nalo-airtime-wallet-engine
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the server:

```bash
npm start
```

The API will run at:

```text
http://localhost:3000
```

You can verify that the service is running by opening:

```text
GET http://localhost:3000
```

## API Endpoints

### Check Wallet Balance

```http
GET /api/wallet
```

Example response:

```json
{
  "balance": 1000
}
```

### Process Bulk Airtime File

```http
POST /api/bulk
```

Send the CSV using `multipart/form-data` with the field name:

```text
file
```

Example using curl:

```bash
curl -X POST http://localhost:3000/api/bulk \
  -F "file=@data/sample-airtime.csv"
```

### Reset Wallet

```http
POST /api/wallet/reset
```

Example request:

```json
{
  "balance": 1000
}
```

## CSV Format

Example:

```csv
phone_number,amount,network
0241234567,100,MTN
233501234567,150,Telecel
0271234567,200,AT
```

The CSV must contain the following columns:

```text
phone_number
amount
network
```

## Transaction Processing

Transactions are processed sequentially.

For example, if the opening wallet balance is:

```text
GHS 100
```

and the transactions are:

```text
0241111111,40,MTN
0202222222,50,Telecel
0273333333,30,AT
0244444444,10,MTN
```

the processing result will be:

```text
Opening balance: 100

Transaction 1: 40
Remaining balance: 60
SUCCESS

Transaction 2: 50
Remaining balance: 10
SUCCESS

Transaction 3: 30
FAILED - insufficient balance

Transaction 4: 10
Remaining balance: 0
SUCCESS
```

A failed transaction never modifies the wallet balance.

Processing also continues after a failed transaction.

## Validation Rules

A transaction is rejected if:

* the phone number is invalid
* the amount is missing
* the amount is not numeric
* the amount is zero
* the amount is negative
* the network is unsupported
* the same transaction appears more than once in the batch
* the amount exceeds the remaining wallet balance

Each rejected transaction contains a reason explaining why it failed.

## Duplicate Handling

Each transaction is compared using its normalized phone number, network and amount.

For example:

```text
0241234567,100,MTN
```

and:

```text
233241234567,100,MTN
```

are considered duplicates because both phone numbers represent the same Ghanaian number after normalization.

The duplicate transaction is rejected and does not affect the wallet balance.

## Wallet Integrity

The wallet balance changes only after a transaction:

1. passes validation
2. passes duplicate detection
3. has sufficient available balance

Invalid or unsuccessful transactions therefore cannot reduce the wallet balance.

Transactions are processed one at a time using the latest running balance.

## Example Summary

A processed batch returns information similar to:

```json
{
  "summary": {
    "totalRows": 7,
    "successful": 4,
    "failed": 3,
    "totalDebited": 750,
    "openingBalance": 1000,
    "finalBalance": 250
  }
}
```

The response also contains the individual successful and failed transactions.

## Running Tests

Run:

```bash
npm test
```

The test suite verifies areas including:

* local Ghanaian phone validation
* international Ghanaian phone validation
* invalid phone numbers
* wallet deductions
* insufficient balance handling
* continuation after failed transactions
* duplicate detection

## Design Decisions

### Sequential Processing

Transactions are intentionally processed in file order because each transaction depends on the wallet balance produced by the transaction before it.

### Failed Transactions Do Not Mutate Wallet State

Validation and balance checks happen before the wallet is modified.

This prevents bad rows from corrupting the wallet balance.

### Phone Number Normalization

International Ghanaian numbers are normalized to local format before processing. This makes validation and duplicate detection more consistent.

### Continue After Failure

A transaction failure affects only that transaction. The rest of the CSV continues to be processed.

This allows later transactions that still fit within the available balance to succeed.

## Possible Production Improvements

For a production financial system I would extend the implementation with:

* PostgreSQL or another transactional database
* database transactions and row locking
* authentication and authorization
* idempotency keys for external requests
* batch identifiers
* audit logs
* transaction reference IDs
* rate limiting
* structured application logging
* queue-based asynchronous processing
* monitoring and alerting
* stronger network-prefix validation
* API documentation using OpenAPI/Swagger

The current implementation intentionally remains small and focused on the requirements of the challenge.

## Author

Elliot Datsomor
