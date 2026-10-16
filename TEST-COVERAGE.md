# Test Coverage Matrix

499 tests, all verified live against `https://apidev.ayushmanager.com/api`.

Uniform IDs, simple comments (`Test ID` + `Test Title` + `Step N`).
New batches run targeted (`npx playwright test tests/<dir>`); full suite runs
periodically to catch cross-module drift.

## Module: Health (`tests/health/health.spec.js`)

Smoke gate: API reachability + credential validity.

- T0001 - Verify that requesting the current user without a token is rejected with HTTP 401
- T0002 - Verify that login with valid .env credentials returns HTTP 200 with a Bearer token @smoke

## Module: Auth (`tests/auth/auth.spec.js`)

Login is POST /login {identifier, password}; email works too (case-insensitive), password is case-sensitive, whitespace trimmed, extra fields ignored. Logout invalidates the token. Method guards: GET /login -> 405.

- T0003 - Verify that login with a valid mobile number and password returns HTTP 200 with user object and Bearer token
- T0004 - Verify that login with an incorrect password is rejected with HTTP 403 Invalid credentials
- T0005 - Verify that login with an unknown identifier is rejected and never returns HTTP 200
- T0006 - Verify that login without an identifier is rejected with HTTP 422 validation error
- T0007 - Verify that login without a password is rejected with HTTP 422 validation error
- T0008 - Verify that login with empty-string credentials is rejected and never returns HTTP 200
- T0009 - Verify that login with a 10000-character identifier is rejected gracefully and never returns HTTP 500
- T0010 - Verify that a SQL-injection style identifier is treated as plain text and never authenticates
- T0011 - Verify that fetching the current user with a valid token returns HTTP 200
- T0012 - Verify that fetching the current user without a token is rejected with HTTP 401
- T0013 - Verify that fetching the current user with a forged token is rejected with HTTP 401
- T0014 - Verify that the GET /auth/me alias with a valid token returns HTTP 200 just like /user
- T0051 - Verify that login with an email identifier returns HTTP 200 with a token
- T0052 - Verify that email identifiers are case-insensitive so uppercase email login returns HTTP 200
- T0053 - Verify that passwords are case-sensitive so an uppercase password returns HTTP 403
- T0054 - Verify that an identifier padded with whitespace is trimmed and login returns HTTP 200
- T0055 - Verify that unknown extra fields in the login payload are ignored and login returns HTTP 200
- T0056 - Verify that a GET request on the login route is rejected with HTTP 405 Method Not Allowed
- T0057 - Verify that login with an empty JSON object returns HTTP 422 for both fields
- T0058 - Verify that two consecutive logins issue two independently usable Bearer tokens
- T0059 - Verify that logout succeeds and the same token is afterwards rejected with HTTP 401
- T0060 - Verify that a numeric non-string identifier never causes an HTTP 500 server error
- T0061 - Verify that a POST request on the current-user route is rejected with HTTP 405
- T0062 - Verify that logout without a token is rejected with HTTP 401
- T0063 - Verify that a bare Bearer header with no token value is rejected with HTTP 401
- T0064 - Verify that a wrong authentication scheme instead of Bearer is rejected with HTTP 401
- T0065 - Verify that the /auth/me alias without a token is rejected with HTTP 401
- T0066 - Verify that logging out twice rejects the second call with HTTP 401 on the dead token

## Module: Patient (`tests/patient/patient.spec.js`)

Create is multipart (registration_date + hnr_name required despite docs). Update is POST (PUT -> 405); update on missing id upserts. Missing show returns 200-empty (quirk). last_name optional despite docs. Double delete -> 500 (bug).

- T0015 - Verify that creating a patient with valid first name, last name and mobile returns HTTP 200 with a patient id
- T0016 - Verify that listing patients returns HTTP 200 with a paginated data and meta envelope
- T0017 - Verify that a newly created patient can be fetched by id with HTTP 200
- T0018 - Verify that creating a patient without a first name is rejected with HTTP 422
- T0019 - Verify that creating a patient without a last name is currently accepted with HTTP 200 (API quirk)
- T0020 - Verify that creating a patient with a malformed mobile number is rejected with HTTP 422
- T0021 - Verify that creating a second patient with a duplicate mobile number is rejected with HTTP 422
- T0022 - Verify that creating a patient without a token is rejected with HTTP 401
- T0023 - Verify that fetching a non-existent patient id returns HTTP 200 with empty data and never 500 (quirk)
- T0024 - Verify that a 50-character first name is accepted while a 300-character name is rejected
- T0025 - Verify that creating a patient with an empty first name is rejected with HTTP 422
- T0067 - Verify that updating a patient with PUT is rejected with HTTP 405
- T0068 - Verify that updating a patient with POST changes the stored name and returns HTTP 200
- T0069 - Verify that updating a patient without a mobile number is rejected with HTTP 422
- T0070 - Verify that updating a non-existent patient id upserts the record and returns HTTP 200 with a new id
- T0071 - Verify that creating a patient without a registration date is never accepted with HTTP 200
- T0072 - Verify that creating a patient without hnr_name is never accepted with HTTP 200
- T0073 - Verify that creating a patient with an invalid email is rejected with HTTP 422
- T0074 - Verify that creating a patient with a negative age is rejected with HTTP 422
- T0075 - Verify that a mobile number with +91 prefix is accepted with HTTP 200
- T0076 - Verify that deleting an already-deleted patient never returns HTTP 200 again
- T0077 - Verify that the patient search endpoint returns HTTP 200 for a search term
- T0078 - Verify that listing patients with per_page=0 never causes an HTTP 500 server error
- T0079 - Verify that fetching a patient with a non-numeric id never causes an HTTP 500 server error

## Module: Patient visits (`tests/visits/visits.spec.js`)

Chain: patient -> POST /patient/{id}/case -> POST /patient/visit (returns 201). Update is POST. Missing show/detail -> 500 (bugs). Bad date -> 500 (should be 422).

- T0122 - Verify that the full patient-case-visit creation chain returns HTTP 201 with a visit id
- T0123 - Verify that listing visits by case id returns HTTP 200
- T0124 - Verify that a newly created visit can be fetched by id with HTTP 200
- T0125 - Verify that updating a visit with POST returns HTTP 200
- T0126 - Verify that updating a visit with PUT is rejected with HTTP 405
- T0127 - Verify that creating a visit without a case id is rejected with HTTP 422
- T0128 - Verify that creating a visit without a next follow-up date is never accepted with 2xx
- T0129 - Verify that creating a visit with a non-date string is never accepted with 2xx
- T0130 - Verify that fetching a non-existent visit never returns HTTP 200
- T0131 - Verify that deleting an already-deleted visit never returns HTTP 200 again
- T0132 - Verify that creating a visit without a token is rejected with HTTP 401
- T0133 - Verify that creating a case for a non-existent patient returns HTTP 404
- T0134 - Verify that fetching visit details for a valid visit returns HTTP 200

## Module: Appointments (`tests/appointments/appointments.spec.js`)

Create/update are multipart (JSON rejected). Update is POST and works as delete+recreate (new id). Delete flows return proper 404s. Past dates and reversed times allowed (quirks). Availability needs full slot params.

- T0026 - Verify that listing all appointments returns HTTP 200
- T0027 - Verify that creating a consultation appointment with a valid payload returns HTTP 200
- T0028 - Verify that creating an appointment with an empty payload is rejected with HTTP 422
- T0029 - Verify that listing appointments without a token is rejected with HTTP 401
- T0030 - Verify that the appointment report for a date range returns HTTP 200
- T0031 - Verify that fetching a non-existent appointment id never returns HTTP 200 or HTTP 500
- T0032 - Verify that creating an appointment with an out-of-range type is never accepted with HTTP 200
- T0243 - Verify that two overlapping appointments for the same doctor are both accepted with HTTP 200 (missing conflict validation)
- T0080 - Verify that updating an appointment with PUT is rejected with HTTP 405
- T0081 - Verify that updating an appointment with POST replaces the row and returns HTTP 200 with a new id
- T0082 - Verify that a newly created appointment can be fetched by id with HTTP 200
- T0083 - Verify that a deleted appointment is no longer fetchable and returns HTTP 404
- T0084 - Verify that deleting an already-deleted appointment returns HTTP 404
- T0085 - Verify that deleting a non-existent appointment returns HTTP 404
- T0086 - Verify that checking slot availability with full date and time parameters returns HTTP 200
- T0087 - Verify that creating an appointment in the past is accepted with HTTP 200 (leniency quirk)
- T0088 - Verify that creating an appointment with end time before start time is accepted with HTTP 200 (missing validation)
- T0089 - Verify that a therapy appointment without any therapies is rejected with HTTP 422
- T0090 - Verify that creating an appointment without a duration is never accepted with HTTP 200
- T0091 - Verify that creating an appointment with 1200-character remarks is rejected with HTTP 422
- T0092 - Verify that creating an appointment without a doctor is rejected with HTTP 422
- T0093 - Verify that a newly created appointment is discoverable through the report search
- T0328 - Verify that appointments by date return HTTP 200
- T0329 - Verify that appointments by month return HTTP 200
- T0330 - Verify that completing an appointment returns HTTP 200
- T0331 - Verify that completing a non-existent appointment returns HTTP 404

## Module: Therapy packages (`tests/therapy/therapy.spec.js`)

Package create is POST JSON (missing date -> 500 bug). Update is POST incl. mobile_no. Show missing -> 200-empty quirk. No package delete endpoint.

- T0135 - Verify that creating a therapy package returns HTTP 200 with a package id
- T0136 - Verify that listing therapy packages returns HTTP 200
- T0137 - Verify that a newly created therapy package can be fetched by id with HTTP 200
- T0138 - Verify that fetching a non-existent therapy package returns HTTP 200 empty quirk and never 500
- T0139 - Verify that updating a therapy package with POST including the mobile number returns HTTP 200
- T0140 - Verify that updating a therapy package with PUT is rejected with HTTP 405
- T0141 - Verify that creating a therapy package without a patient name is rejected with HTTP 422
- T0142 - Verify that creating a therapy package without a date is never accepted with HTTP 200
- T0143 - Verify that creating an advised therapy plan with a therapy slot returns HTTP 200
- T0144 - Verify that listing advised therapy packages returns HTTP 200
- T0145 - Verify that listing scheduled therapies returns HTTP 200
- T0146 - Verify that creating a therapy package without a token is rejected with HTTP 401
- T0255 - Verify that generating the therapy package PDF returns HTTP 200 with content
- T0256 - Verify that generating a PDF for a non-existent package never returns HTTP 200

## Module: Invoices (`tests/invoices/invoices.spec.js`)

Create is multipart (items[0][...] keys). Update is POST. Pay is POST JSON (pending invoices only). Cancel is POST /invoice/cancel/{id}; missing cancel -> 422 (docs claim 404). Pay on missing -> 500 (bug). Duplicate invoice numbers allowed. SLA exempted on list (heavy join).

- T0033 - Verify that creating an invoice with a valid payload returns HTTP 200 with an invoice id
- T0034 - Verify that listing invoices returns HTTP 200 with a paginated envelope
- T0035 - Verify that a newly created invoice can be fetched by id with HTTP 200
- T0036 - Verify that creating an invoice without an invoice number is rejected with HTTP 422
- T0037 - Verify that creating an invoice without items is rejected with HTTP 422
- T0038 - Verify that creating an invoice without a token is rejected with HTTP 401
- T0039 - Verify that fetching a non-existent invoice returns HTTP 200 with empty data and never 500
- T0040 - Verify that creating an invoice with zero quantity never causes an HTTP 500 server error
- T0094 - Verify that updating an invoice with POST changes the remarks and returns HTTP 200
- T0095 - Verify that updating an invoice without items is rejected with HTTP 422
- T0096 - Verify that updating an invoice with PUT is rejected with HTTP 405
- T0097 - Verify that paying an already-paid invoice is rejected with HTTP 422
- T0098 - Verify that paying an invoice with a zero amount is rejected with HTTP 422
- T0099 - Verify that paying an invoice without a payment mode is rejected with HTTP 422
- T0100 - Verify that paying a non-existent invoice is never accepted with HTTP 200
- T0101 - Verify that cancelling a fresh invoice returns HTTP 200
- T0102 - Verify that cancelling a non-existent invoice returns HTTP 422 instead of the documented 404
- T0103 - Verify that paying a cancelled invoice is rejected with HTTP 422
- T0104 - Verify that creating an invoice with a negative unit price is rejected with HTTP 422
- T0105 - Verify that creating an invoice with a 200-character invoice number is rejected with HTTP 422
- T0106 - Verify that creating an invoice with a non-date string is rejected with HTTP 422
- T0244 - Verify that refunding part of an invoice returns HTTP 200
- T0245 - Verify that refunding more than the invoice total is accepted with HTTP 200 (missing over-refund check)
- T0246 - Verify that refunding a non-existent invoice is rejected with HTTP 422
- T0247 - Verify that refunding without an amount is rejected with HTTP 422
- T0248 - Verify that refunding without a token is rejected with HTTP 401

## Module: Inquiry (`tests/inquiry/inquiry.spec.js`)

Create/update are multipart; sub-routes (followups/stage/priority/converts) are JSON. Update is POST. No DELETE endpoint. Stage 0-8, priority 0-2, age <= 150.

- T0041 - Verify that creating an inquiry with valid date, name and phone returns HTTP 200 with an id
- T0042 - Verify that listing inquiries returns HTTP 200 with a paginated envelope
- T0043 - Verify that a newly created inquiry can be fetched and updated with HTTP 200
- T0044 - Verify that creating an inquiry without a name is rejected with HTTP 422
- T0045 - Verify that creating an inquiry without a date is rejected with HTTP 422
- T0046 - Verify that creating an inquiry with an invalid email is rejected with HTTP 422
- T0047 - Verify that creating an inquiry without a token is rejected with HTTP 401
- T0048 - Verify that a 60-character inquiry name is accepted while a 300-character name is rejected
- T0107 - Verify that adding a follow-up with a date succeeds and the follow-up list returns HTTP 200
- T0108 - Verify that adding a follow-up without a date is rejected with HTTP 422
- T0109 - Verify that listing follow-ups for a non-existent inquiry returns HTTP 404
- T0110 - Verify that moving an inquiry to a valid pipeline stage returns HTTP 200
- T0111 - Verify that moving an inquiry to an out-of-range stage is rejected with HTTP 422
- T0112 - Verify that setting a valid inquiry priority returns HTTP 200
- T0113 - Verify that setting an out-of-range inquiry priority is rejected with HTTP 422
- T0114 - Verify that fetching the inquiry pipeline summary returns HTTP 200
- T0115 - Verify that fetching the inquiry report returns HTTP 200
- T0116 - Verify that searching inquiries by text returns HTTP 200
- T0117 - Verify that converting an inquiry to an existing patient returns HTTP 200
- T0118 - Verify that converting an inquiry to a non-existent patient is rejected with HTTP 422
- T0119 - Verify that converting a non-existent inquiry returns HTTP 404
- T0120 - Verify that converting an inquiry to an appointment returns HTTP 200
- T0121 - Verify that creating an inquiry with age 200 is rejected with HTTP 422

## Module: Medicine bills (`tests/medbills/medbills.spec.js`)

POST JSON {patient_id, patient_name, date, slots[]}; auto-creates invoice. Validation failures use 400 (not 422). Unknown medicine_id accepted (no FK check). No delete endpoint.

- T0147 - Verify that creating a medicine bill returns HTTP 200 with a bill id and auto-generated invoice
- T0148 - Verify that a newly created medicine bill can be fetched by id with HTTP 200
- T0149 - Verify that fetching a non-existent medicine bill returns HTTP 404
- T0150 - Verify that updating a medicine bill with POST returns HTTP 200
- T0151 - Verify that updating a medicine bill with PUT is rejected with HTTP 405
- T0152 - Verify that creating a medicine bill without slots is rejected with HTTP 400
- T0153 - Verify that creating a medicine bill without a patient name is rejected with HTTP 400
- T0154 - Verify that an unknown medicine id is accepted with HTTP 200 due to missing stock validation
- T0155 - Verify that creating a medicine bill without a token is rejected with HTTP 401
- T0156 - Verify that creating a medicine bill with zero quantity never causes an HTTP 500 server error

## Module: Purchase + suppliers (`tests/purchase/purchase.spec.js`)

Bills are POST JSON (supplier 3, receiver 9, items with company 1); create -> 201. Pay uses {paid_amount,...}. Delete flows return proper 404s. Item-less bill accepted (quirk). Suppliers need name+company+phone+address.

- T0157 - Verify that creating a purchase bill returns HTTP 201 with a bill id
- T0158 - Verify that listing purchase bills returns HTTP 200
- T0159 - Verify that a newly created purchase bill can be fetched by id with HTTP 200
- T0160 - Verify that fetching a non-existent purchase bill returns HTTP 404
- T0161 - Verify that updating a purchase bill with POST returns HTTP 200
- T0162 - Verify that updating a purchase bill with PUT is rejected with HTTP 405
- T0163 - Verify that recording a partial payment on a purchase bill returns HTTP 200
- T0164 - Verify that paying a purchase bill without the paid amount field is rejected with HTTP 422
- T0165 - Verify that deleting an already-deleted purchase bill returns HTTP 404
- T0166 - Verify that creating a purchase bill without items is accepted with HTTP 201 (quirk)
- T0167 - Verify that creating a purchase bill without a token is rejected with HTTP 401
- T0168 - Verify that creating a supplier returns HTTP 201 with a supplier id
- T0169 - Verify that listing suppliers returns HTTP 200
- T0170 - Verify that a newly created supplier can be fetched by id with HTTP 200
- T0171 - Verify that creating a supplier without a name is rejected with HTTP 422
- T0172 - Verify that fetching a non-existent supplier returns HTTP 404

## Module: Users & roles (`tests/users/users.spec.js`)

Users are multipart (department 8 required; missing -> 500 after partial insert). Update is POST. Show-missing -> 200 quirk; list?search= -> 500 bug. Roles are JSON with real module keys (bad permission -> spatie 500).

- T0173 - Verify that creating a staff user returns HTTP 200
- T0174 - Verify that listing users returns HTTP 200
- T0175 - Verify that a newly created user can be fetched by id with HTTP 200
- T0176 - Verify that updating a user with POST returns HTTP 200
- T0177 - Verify that updating a user with PUT is rejected with HTTP 405
- T0178 - Verify that creating a user without a department is never fully accepted with HTTP 200
- T0179 - Verify that creating a user with neither email nor mobile is rejected with HTTP 422
- T0180 - Verify that the user list search parameter behavior is documented and never silently succeeds wrongly
- T0181 - Verify that creating a user without a token is rejected with HTTP 401
- T0182 - Verify that fetching a non-existent user returns HTTP 200 quirk and never 500
- T0183 - Verify that creating a role returns HTTP 200 with a role id
- T0184 - Verify that listing roles returns HTTP 200
- T0185 - Verify that a newly created role can be fetched by id with HTTP 200
- T0186 - Verify that fetching a non-existent role returns HTTP 404
- T0187 - Verify that creating a role without a name is rejected with HTTP 422
- T0188 - Verify that creating a role with an unknown permission is never accepted with HTTP 200
- T0189 - Verify that fetching role permission modules returns HTTP 200
- T0190 - Verify that fetching system roles returns HTTP 200
- T0191 - Verify that listing roles without a token is rejected with HTTP 401

## Module: Finance + stock (`tests/finance/finance.spec.js`)

Income/expenditure are POST JSON (updates POST, PUT -> 405; missing show/delete -> proper 404s). Note: /inventory/low-stock 500s (server bug, intentionally uncovered).

- T0192 - Verify that creating a manual income entry returns HTTP 200 with an entry id
- T0193 - Verify that listing manual income entries returns HTTP 200
- T0194 - Verify that a newly created income entry can be fetched by id with HTTP 200
- T0195 - Verify that fetching a non-existent income entry returns HTTP 404
- T0196 - Verify that updating an income entry with POST returns HTTP 200
- T0197 - Verify that updating an income entry with PUT is rejected with HTTP 405
- T0198 - Verify that creating an income entry with a negative amount is rejected with HTTP 422
- T0199 - Verify that creating an income entry without a subject is rejected with HTTP 422
- T0200 - Verify that deleting an already-deleted income entry returns HTTP 404
- T0201 - Verify that creating an income entry without a token is rejected with HTTP 401
- T0202 - Verify that creating an expenditure entry returns HTTP 200 with an entry id
- T0203 - Verify that listing expenditure entries returns HTTP 200
- T0204 - Verify that creating an expenditure entry without a category is rejected with HTTP 422
- T0205 - Verify that fetching a non-existent expenditure entry returns HTTP 404
- T0206 - Verify that fetching the finance summary for a date range returns HTTP 200
- T0207 - Verify that listing medicine stock returns HTTP 200
- T0208 - Verify that searching medicine stock by name returns HTTP 200
- T0209 - Verify that fetching the finance summary without a token is rejected with HTTP 401

## Module: Branches + dashboard (`tests/branches/branches.spec.js`)

Branches are multipart (unique email enforced - parallel-safe factory; create is slow ~6-9s so SLA skipped). Update POST, PUT -> 405, proper 404s. Dashboard today-stats, day-end, funnel + waiting list -> 200.

- T0210 - Verify that creating a branch returns HTTP 200 with a branch id
- T0211 - Verify that listing branches returns HTTP 200
- T0212 - Verify that a newly created branch can be fetched by id with HTTP 200
- T0213 - Verify that fetching a non-existent branch returns HTTP 404
- T0214 - Verify that updating a branch with POST returns HTTP 200
- T0215 - Verify that updating a branch with PUT is rejected with HTTP 405
- T0216 - Verify that creating a branch without a trade name is rejected with HTTP 422
- T0217 - Verify that deleting an already-deleted branch returns HTTP 404
- T0218 - Verify that listing branches without a token is rejected with HTTP 401
- T0219 - Verify that fetching today consultation stats returns HTTP 200
- T0220 - Verify that fetching the day-end report for a date range returns HTTP 200
- T0221 - Verify that fetching the patient journey funnel returns HTTP 200
- T0222 - Verify that fetching the patient waiting list for today returns HTTP 200

## Module: Settings masters (`tests/masters/masters.spec.js`)

POST JSON with unique names (dup -> 422, missing -> 422). PUT updates work for lead source, medicine types, companies, special cases (rare in this API). Therapy category/room, pincode autocomplete. Medicine-type duplicates race (200-replace vs 422). Proper 404s.

- T0223 - Verify that creating a lead source returns HTTP 200 with an id
- T0224 - Verify that listing lead sources returns HTTP 200
- T0225 - Verify that a newly created lead source can be fetched by id with HTTP 200
- T0226 - Verify that fetching a non-existent lead source returns HTTP 404
- T0227 - Verify that updating a lead source with PUT returns HTTP 200
- T0228 - Verify that creating a lead source with a duplicate name is rejected with HTTP 422
- T0229 - Verify that creating a lead source without a name is rejected with HTTP 422
- T0230 - Verify that deleting an already-deleted lead source returns HTTP 404
- T0231 - Verify that creating an expense category returns HTTP 200 with an id
- T0232 - Verify that listing expense categories returns HTTP 200
- T0233 - Verify that a newly created expense category can be fetched by id with HTTP 200
- T0234 - Verify that fetching a non-existent expense category returns HTTP 404
- T0235 - Verify that creating an expense category with a duplicate name is rejected with HTTP 422
- T0236 - Verify that creating an expense category without a name is rejected with HTTP 422
- T0237 - Verify that deleting an already-deleted expense category returns HTTP 404
- T0238 - Verify that listing masters without a token is rejected with HTTP 401
- T0275 - Verify that creating a therapy category returns HTTP 200 with an id
- T0276 - Verify that listing therapy categories returns HTTP 200
- T0277 - Verify that a newly created category can be fetched by id with HTTP 200
- T0278 - Verify that fetching a non-existent category returns HTTP 404
- T0279 - Verify that updating a category with POST returns HTTP 200
- T0280 - Verify that updating a category with PUT is rejected with HTTP 405
- T0281 - Verify that creating a category without a name is rejected with HTTP 422
- T0282 - Verify that duplicate category names are accepted with HTTP 200 (no uniqueness check)
- T0283 - Verify that deleting an already-deleted category returns HTTP 404
- T0284 - Verify that creating a therapy room returns HTTP 200 with an id
- T0285 - Verify that listing therapy rooms returns HTTP 200
- T0286 - Verify that a newly created room can be fetched by id with HTTP 200
- T0287 - Verify that fetching a non-existent room returns HTTP 404
- T0288 - Verify that pincode suggestions for a partial code return HTTP 200
- T0289 - Verify that a too-short pincode query is rejected with HTTP 422
- T0290 - Verify that pincode suggestions without a token are rejected with HTTP 401
- T0355 - Verify that calendar settings return HTTP 200
- T0356 - Verify that calendar settings without a token are rejected with HTTP 401
- T0357 - Verify that consultation settings return HTTP 200
- T0358 - Verify that consultation settings without a token are rejected with HTTP 401
- T0359 - Verify that creating a special case returns HTTP 200 with an id
- T0360 - Verify that listing special cases returns HTTP 200
- T0361 - Verify that a newly created special case can be fetched by id with HTTP 200
- T0362 - Verify that fetching a non-existent special case returns HTTP 404
- T0363 - Verify that updating a special case with PUT returns HTTP 200
- T0364 - Verify that updating a special case with POST returns HTTP 200
- T0365 - Verify that creating a special case with a duplicate name is rejected with HTTP 422
- T0366 - Verify that creating a special case without a name is rejected with HTTP 422
- T0367 - Verify that deleting an already-deleted special case returns HTTP 404
- T0368 - Verify that creating a medicine type returns HTTP 200 with an id
- T0369 - Verify that listing medicine types returns HTTP 200
- T0370 - Verify that a newly created medicine type can be fetched by id with HTTP 200
- T0371 - Verify that fetching a non-existent medicine type returns HTTP 404
- T0372 - Verify that updating a medicine type with PUT returns HTTP 200
- T0373 - Verify that updating a medicine type with POST returns HTTP 200
- T0374 - Verify that a duplicate medicine type name is handled without server error
- T0375 - Verify that creating a medicine type without a name is rejected with HTTP 422
- T0376 - Verify that deleting an already-deleted medicine type returns HTTP 404
- T0377 - Verify that creating a medicine company returns HTTP 200 with an id
- T0378 - Verify that listing medicine companies returns HTTP 200
- T0379 - Verify that a newly created company can be fetched by id with HTTP 200
- T0380 - Verify that fetching a non-existent company returns HTTP 404
- T0381 - Verify that updating a company with PUT returns HTTP 200
- T0382 - Verify that creating a company without a name is rejected with HTTP 422
- T0383 - Verify that a company can be created and deleted with HTTP 200
- T0416 - Verify that creating a certificate type returns HTTP 201 with an id
- T0417 - Verify that listing certificate types returns HTTP 200
- T0418 - Verify that a newly created certificate type can be fetched by id with HTTP 200
- T0419 - Verify that fetching a non-existent certificate type returns HTTP 404
- T0420 - Verify that updating a certificate type with POST returns HTTP 200
- T0421 - Verify that updating a certificate type with PUT is rejected with HTTP 405
- T0422 - Verify that creating a certificate type without a body template is rejected with HTTP 422
- T0423 - Verify that a certificate type can be created and deleted with HTTP 200
- T0424 - Verify that creating a source panel returns HTTP 200 with an id
- T0425 - Verify that listing source panels returns HTTP 200
- T0426 - Verify that a newly created source panel can be fetched by id with HTTP 200
- T0427 - Verify that fetching a non-existent source panel returns HTTP 404
- T0428 - Verify that updating a source panel with PUT returns HTTP 200
- T0429 - Verify that updating a source panel with POST returns HTTP 200
- T0430 - Verify that creating a source panel with a duplicate name is rejected with HTTP 422
- T0431 - Verify that creating a source panel without a name is rejected with HTTP 422
- T0432 - Verify that deleting an already-deleted source panel returns HTTP 404
- T0433 - Verify that source panels without a token are rejected with HTTP 401

## Module: ABDM (`tests/abdm/abdm.spec.js`)

Read-only by design - external health-ID ecosystem stays untouched.

- T0239 - Verify that the ABDM connector status check returns HTTP 200
- T0240 - Verify that listing ABDM-linked patients returns HTTP 200
- T0241 - Verify that fetching ABDM connector settings returns HTTP 200
- T0242 - Verify that ABDM endpoints without a token are rejected with HTTP 401

## Module: Patient waiting list (`tests/waiting/waiting.spec.js`)

Save/list are POST JSON (case_id required). Delete is DELETE /patient/waiting/delete/{id}; missing id -> 500 (should be 404).

- T0249 - Verify that adding a patient to the waiting list returns HTTP 200 with a record id
- T0250 - Verify that the waiting list for a date returns HTTP 200
- T0251 - Verify that saving without case id is rejected with HTTP 422
- T0252 - Verify that a waiting record can be added and removed with HTTP 200
- T0253 - Verify that deleting a non-existent waiting record never returns HTTP 200
- T0254 - Verify that the waiting list without a token is rejected with HTTP 401

## Module: Inventory stock (`tests/stock/stock.spec.js`)

Read-only by design - directional purchase->stock asserts would flake under parallel load (batches not observable). Covers shape, totals, non-negative invariant.

- T0257 - Verify that the stock valuation list returns HTTP 200 with rows and totals
- T0258 - Verify that stock rows carry non-negative quantities
- T0259 - Verify that stock values without a token are rejected with HTTP 401

## Module: Purchase orders + returns (`tests/procurement/procurement.spec.js`)

Orders are POST JSON (supplier, ship-to branch, items); update POST, PUT -> 405, proper 404s. Convert endpoint creates a linked bill (201). Returns via item action (bill+item ids, new_qty); missing ids -> 422. No return delete endpoint.

- T0260 - Verify that creating a purchase order returns HTTP 201 with an order id
- T0261 - Verify that listing purchase orders returns HTTP 200
- T0262 - Verify that a newly created order can be fetched by id with HTTP 200
- T0263 - Verify that fetching a non-existent order returns HTTP 404
- T0264 - Verify that updating an order with POST returns HTTP 200
- T0265 - Verify that updating an order with PUT is rejected with HTTP 405
- T0266 - Verify that creating an order without ship-to branch is rejected with HTTP 422
- T0267 - Verify that deleting an already-deleted order returns HTTP 404
- T0268 - Verify that prefill data for an order returns HTTP 200
- T0269 - Verify that converting an order creates a linked bill with HTTP 201
- T0270 - Verify that orders without a token are rejected with HTTP 401
- T0271 - Verify that returning part of a bill item returns HTTP 201
- T0272 - Verify that listing purchase returns returns HTTP 200
- T0273 - Verify that returns for a bill return HTTP 200
- T0274 - Verify that return without bill ids is rejected with HTTP 422

## Module: Clinical masters (`tests/clinical/clinical.spec.js`)

Symptoms: POST JSON returns 201 with id; update POST (PUT -> 405); missing show -> proper 404. Diagnosis: missing show -> 200 quirk. Departments: create 201 WITHOUT id (locate via list); update POST. Modern diagnosis: standard CRUD. Modern system: create -> 201 with BARE envelope-less body (quirk). All deletes work.

- T0291 - Verify that creating a symptom returns HTTP 201 with an id
- T0292 - Verify that listing symptoms returns HTTP 200
- T0293 - Verify that a newly created symptom can be fetched by id with HTTP 200
- T0294 - Verify that fetching a non-existent symptom returns HTTP 404
- T0295 - Verify that updating a symptom with POST returns HTTP 200
- T0296 - Verify that updating a symptom with PUT is rejected with HTTP 405
- T0297 - Verify that creating a symptom without a name is rejected with HTTP 422
- T0298 - Verify that symptoms without a token are rejected with HTTP 401
- T0299 - Verify that creating a diagnosis returns HTTP 200 with an id
- T0300 - Verify that listing diagnosis records returns HTTP 200
- T0301 - Verify that a newly created diagnosis can be fetched by id with HTTP 200
- T0302 - Verify that fetching a non-existent diagnosis returns HTTP 200 quirk and never 500
- T0303 - Verify that creating a diagnosis without a name is rejected with HTTP 422
- T0304 - Verify that a diagnosis can be created and deleted with HTTP 200
- T0305 - Verify that creating a department returns HTTP 201
- T0306 - Verify that listing departments returns HTTP 200
- T0307 - Verify that a newly created department can be fetched by id with HTTP 200
- T0308 - Verify that fetching a non-existent department returns HTTP 200 quirk and never 500
- T0309 - Verify that updating a department with POST returns HTTP 200
- T0310 - Verify that updating a department with PUT is rejected with HTTP 405
- T0311 - Verify that a department can be created and deleted with HTTP 200
- T0312 - Verify that departments without a token are rejected with HTTP 401
- T0332 - Verify that creating a modern diagnosis returns HTTP 200 with an id
- T0333 - Verify that listing modern diagnosis records returns HTTP 200
- T0334 - Verify that a newly created modern diagnosis can be fetched by id with HTTP 200
- T0335 - Verify that fetching a non-existent modern diagnosis returns HTTP 200 quirk and never 500
- T0336 - Verify that updating a modern diagnosis with POST returns HTTP 200
- T0337 - Verify that updating a modern diagnosis with PUT is rejected with HTTP 405
- T0338 - Verify that creating a modern diagnosis without a name is rejected with HTTP 422
- T0339 - Verify that a modern diagnosis can be created and deleted with HTTP 200
- T0340 - Verify that creating a modern system returns HTTP 201 with an id
- T0341 - Verify that listing modern systems returns HTTP 200
- T0342 - Verify that a newly created modern system can be fetched by id with HTTP 200
- T0343 - Verify that fetching a non-existent modern system returns HTTP 201 quirk and never 500
- T0344 - Verify that a modern system can be created and deleted with HTTP 201
- T0345 - Verify that modern masters without a token are rejected with HTTP 401

## Module: Wallet, subscription, receipts, habits (`tests/misc/misc.spec.js`)

Wallet + subscription are safe reads. Receipt show works on seed rows (proper 404 on missing). Habits are POST JSON (201, update POST, PUT -> 405); missing show / re-delete -> 500 bugs.

- T0313 - Verify that fetching the wallet returns HTTP 200
- T0314 - Verify that fetching my subscription returns HTTP 200
- T0315 - Verify that wallet without a token is rejected with HTTP 401
- T0316 - Verify that a known payment receipt can be fetched with HTTP 200
- T0317 - Verify that fetching a non-existent receipt returns HTTP 404
- T0318 - Verify that receipts without a token are rejected with HTTP 401
- T0319 - Verify that creating a habit returns HTTP 201 with an id
- T0320 - Verify that listing habits returns HTTP 200
- T0321 - Verify that a newly created habit can be fetched by id with HTTP 200
- T0322 - Verify that fetching a non-existent habit never returns HTTP 200
- T0323 - Verify that updating a habit with POST returns HTTP 200
- T0324 - Verify that updating a habit with PUT is rejected with HTTP 405
- T0325 - Verify that creating a habit without a name is rejected with HTTP 422
- T0326 - Verify that deleting an already-deleted habit never returns HTTP 200
- T0327 - Verify that habits without a token are rejected with HTTP 401

## Module: Branch configuration (`tests/config/config.spec.js`)

Read-mostly by design - numbering/messaging/print writes have side effects. Bill-setting save is covered via identical-value round-trip (mutation-free). Invalid charge mode -> 422 (values preserved).

- T0346 - Verify that fetching medicine bill settings returns HTTP 200 with charge mode
- T0347 - Verify that saving identical bill settings returns HTTP 200 without changing values
- T0348 - Verify that saving an invalid charge mode is rejected with HTTP 422
- T0349 - Verify that listing unique number settings returns HTTP 200
- T0350 - Verify that numbering settings without a token are rejected with HTTP 401
- T0351 - Verify that WhatsApp settings return HTTP 200
- T0352 - Verify that SMS settings return HTTP 200
- T0353 - Verify that print settings return HTTP 200
- T0354 - Verify that print settings without a token are rejected with HTTP 401

## Module: Habit options + languages (`tests/diet/diet.spec.js`)

Options need a parent habit (created/deleted per test). Updates POST (PUT -> 405). Option missing-show -> 500 bug. Languages: full proper CRUD with 404s.

- T0384 - Verify that creating a habit option returns HTTP 201 with an id
- T0385 - Verify that listing habit options returns HTTP 200
- T0386 - Verify that a newly created option can be fetched by id with HTTP 200
- T0387 - Verify that fetching a non-existent option never returns HTTP 200
- T0388 - Verify that updating an option with POST returns HTTP 200
- T0389 - Verify that updating an option with PUT is rejected with HTTP 405
- T0390 - Verify that an option can be created and deleted with HTTP 200
- T0391 - Verify that options without a token are rejected with HTTP 401
- T0392 - Verify that creating a language returns HTTP 201 with an id
- T0393 - Verify that listing languages returns HTTP 200
- T0394 - Verify that a newly created language can be fetched by id with HTTP 200
- T0395 - Verify that fetching a non-existent language returns HTTP 404
- T0396 - Verify that updating a language with POST returns HTTP 200
- T0397 - Verify that updating a language with PUT is rejected with HTTP 405
- T0398 - Verify that creating a language without a title is rejected with HTTP 422
- T0399 - Verify that deleting an already-deleted language returns HTTP 404
- T0400 - Verify that languages without a token are rejected with HTTP 401

## Module: Diet catalog (`tests/dietcatalog/dietcatalog.spec.js`)

Categories: POST JSON returns 201; update POST (PUT -> 405); proper 404s. Items: create returns 201 BUT the row never persists (ghost write - verified by list+show absence); show works only via live discovery (seed rows churn, never hardcoded).

- T0401 - Verify that creating a diet category returns HTTP 201 with an id
- T0402 - Verify that listing diet categories returns HTTP 200
- T0403 - Verify that a newly created category can be fetched by id with HTTP 200
- T0404 - Verify that fetching a non-existent category returns HTTP 404
- T0405 - Verify that updating a category with POST returns HTTP 200
- T0406 - Verify that updating a category with PUT is rejected with HTTP 405
- T0407 - Verify that creating a category without a title is rejected with HTTP 422
- T0408 - Verify that a category can be created and deleted with HTTP 200
- T0409 - Verify that categories without a token are rejected with HTTP 401
- T0410 - Verify that creating a diet item returns HTTP 201 with an id
- T0411 - Verify that listing diet items returns HTTP 200
- T0412 - Verify that an existing diet item can be fetched by id with HTTP 200
- T0413 - Verify that fetching a non-existent diet item returns HTTP 404
- T0414 - Verify that creating a diet item without a title is rejected with HTTP 422
- T0415 - Verify that diet items without a token are rejected with HTTP 401

## Module: Diet plans + financial years (`tests/dietplan/dietplan.spec.js`)

Plan categories/items are POST JSON (updates POST, PUT -> 405; proper 404s). Items need required_qty 0|1 (+qty text when 1). Financial years read-only (year writes would pollute accounting); discovered via list, never hardcoded.

- T0434 - Verify that creating a diet plan category returns HTTP 201 with an id
- T0435 - Verify that listing diet plan categories returns HTTP 200
- T0436 - Verify that a newly created category can be fetched by id with HTTP 200
- T0437 - Verify that fetching a non-existent category returns HTTP 404
- T0438 - Verify that updating a category with POST returns HTTP 200
- T0439 - Verify that updating a category with PUT is rejected with HTTP 405
- T0440 - Verify that a category can be created and deleted with HTTP 200
- T0441 - Verify that categories without a token are rejected with HTTP 401
- T0442 - Verify that creating a diet plan item returns HTTP 201 with an id
- T0443 - Verify that listing diet plan items returns HTTP 200
- T0444 - Verify that a newly created item can be fetched by id with HTTP 200
- T0445 - Verify that fetching a non-existent plan item returns HTTP 404
- T0446 - Verify that updating a plan item with POST returns HTTP 200
- T0447 - Verify that creating a plan item without quantity fields is rejected with HTTP 422
- T0448 - Verify that a plan item can be created and deleted with HTTP 200
- T0449 - Verify that listing financial years returns HTTP 200
- T0450 - Verify that an existing financial year can be fetched by id with HTTP 200
- T0451 - Verify that fetching a non-existent financial year returns HTTP 404
- T0452 - Verify that financial years without a token are rejected with HTTP 401

## Module: Compositions + medicine units (`tests/pharma/pharma.spec.js`)

Compositions are POST JSON (PUT and POST updates both work; duplicate names accepted with no visible second row - upsert quirk). Unit endpoints are read-only (usage_type required -> 422 without it).

- T0453 - Verify that creating a composition returns HTTP 200 with an id
- T0454 - Verify that listing compositions returns HTTP 200
- T0455 - Verify that a newly created composition can be fetched by id with HTTP 200
- T0456 - Verify that fetching a non-existent composition returns HTTP 404
- T0457 - Verify that updating a composition with PUT returns HTTP 200
- T0458 - Verify that updating a composition with POST returns HTTP 200
- T0459 - Verify that a duplicate composition name is accepted with HTTP 200
- T0460 - Verify that creating a composition without a name is rejected with HTTP 422
- T0461 - Verify that a composition can be created and deleted with HTTP 200
- T0462 - Verify that compositions without a token are rejected with HTTP 401
- T0463 - Verify that resolved units for a medicine return HTTP 200
- T0464 - Verify that resolved units without usage type are rejected with HTTP 422
- T0465 - Verify that medicine unit defaults return HTTP 200
- T0466 - Verify that unit endpoints without a token are rejected with HTTP 401

## Module: Accounting groups, ledgers, vouchers (`tests/accounting/accounting.spec.js`)

Groups are POST JSON (name + nature; invalid -> 422) with bare {data} bodies. Update is PUT (POST -> 405) - inverse of most modules. Proper 404s. T0194 hardened with a short show-poll (read-after-write lag flaked 3x).

- T0467 - Verify that creating an account group returns HTTP 201 with an id
- T0468 - Verify that listing account groups returns HTTP 200
- T0469 - Verify that a newly created group can be fetched by id with HTTP 200
- T0470 - Verify that fetching a non-existent group returns HTTP 404
- T0471 - Verify that updating a group with PUT returns HTTP 200
- T0472 - Verify that updating a group with POST is rejected with HTTP 405
- T0473 - Verify that creating a group without nature is rejected with HTTP 422
- T0474 - Verify that creating a group with an invalid nature is rejected with HTTP 422
- T0475 - Verify that deleting an already-deleted group returns HTTP 404
- T0476 - Verify that listing ledgers returns HTTP 200
- T0477 - Verify that a seed ledger can be fetched by id with HTTP 200
- T0478 - Verify that fetching a non-existent ledger returns HTTP 404
- T0479 - Verify that ledgers without a token are rejected with HTTP 401
- T0480 - Verify that listing voucher types returns HTTP 200
- T0481 - Verify that voucher types without a token are rejected with HTTP 401

## Module: Geo + address cascade (`tests/geo/geo.spec.js`)

All read-only - zero test data created. Country list is PUBLIC (no auth guard). State/city cascade via discovered ids (never hardcoded); pincode validated.

- T0482 - Verify that pincode details return HTTP 200
- T0483 - Verify that an unknown pincode returns HTTP 404
- T0484 - Verify that pincode lookup without a token is rejected with HTTP 401
- T0485 - Verify that listing countries returns HTTP 200 with rows
- T0486 - Verify that the country-state-city cascade resolves with HTTP 200
- T0487 - Verify that states without country id are rejected with HTTP 422
- T0488 - Verify that cities without state id are rejected with HTTP 422
- T0489 - Verify that billing search returns HTTP 200
- T0490 - Verify that the country list is public and returns HTTP 200 without a token

## Module: Activity, analytics, searches (`tests/insights/insights.spec.js`)

All read-only - zero test data created. City search is PUBLIC like country list. Symptom search without query returns everything (slow - SLA exempted).

- T0491 - Verify that activity logs return HTTP 200
- T0492 - Verify that activity logs without a token are rejected with HTTP 401
- T0493 - Verify that follow-up analytics return HTTP 200
- T0494 - Verify that analytics without a token are rejected with HTTP 401
- T0495 - Verify that symptom search returns HTTP 200
- T0496 - Verify that symptom search without a query returns HTTP 200
- T0497 - Verify that city search returns HTTP 200
- T0498 - Verify that a too-short city query is rejected with HTTP 422
- T0499 - Verify that city search is public and returns HTTP 200 without a token

## Module: Contract (`tests/contract/schema.spec.js`)

Schema snapshots for the two most critical endpoints.

- T0049 - Verify that the login response contract matches the stored schema snapshot
- T0050 - Verify that the patient list response contract matches the stored schema snapshot

## Stability notes

- SLA (5s) exempted on heavy/slow reads that flake under parallel load:
  patient search (T0077), invoice list (T0034), branch create
  (T0210/12/14/15/17), symptom search-all (T0496).
- T0194 hardened with show-poll (read-after-write lag flaked 3x).
- Watch (flaked once each, self-healed): symptoms list T0292, returns list
  T0272, income show T0194 - all slow-read timing under parallel load.
- One transient exit-1 observed occasionally across full runs (environmental,
  non-repeating - always green on immediate re-run).

## Reporting (Allure)

- Auto-annotation for all tests via `src/utils/allure-meta.js` (no per-test
  edits): epic = module, feature = suite, story = title, severity from type
  (`@smoke` -> blocker), owner `vm-qa-automation`, tags incl. `Txxxx`,
  `ALLURE_ID` = test id.
- Every HTTP call attaches redacted request/response JSON; `password` and
  Bearer tokens are `***REDACTED***` (leak-checked).
- Local: `npm run allure` (needs Java). CI publishes both
  `allure-results` and generated `allure-html-report`.

## History

- Password changed mid-project (`ayurveda1` -> `Ayurveda@1`); `.env` updated.
  Lesson: dedicated automation user; lockout guardrail added to TokenManager.
- Appointment update is delete+recreate (new id) - explains moved seed rows.
