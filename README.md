# CMH Pipeline Suffix Tool

This project is a simple Node.js CLI utility designed to assist with creating CMH (Commerce Merchandising Hub) query pipelines.  


##  How It Works

1. The script automatically fetches the token
2. Asks user if he wants to create a new org
3. Asks user to create the tracking ID 
4. Asks the user to input a suffix for the CMH pipelines (e.g., `cmh-search-suffix`).
5. Pairs each pipeline name with a corresponding condition ID (first with first, second with second, etc.).
6. Outputs or processes the paired results.

## ️ Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/majdaini-coveo/commerce_setup
   cd commerce_setup

2. install dependancies:

   ```bash
   npm i

3. start the program:
   ```bash
   node ./commerce_tool.js
