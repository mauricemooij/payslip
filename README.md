# payslip

payslip is a command line utility that generates payslip PDFs. 

Setup:
* Run ```npm install```
* Add a .env file and fill out data. See .env.example.
* Add a file data.csv with the payment data to the tmp folder. See data.example.csv for format.
* Run ```node payslip.js``` to generate the latest payslip.
* Run ```node payslip.js --all``` to (re)generate all payslips.
* Payslip PDFs can be found in the tmp folder.
