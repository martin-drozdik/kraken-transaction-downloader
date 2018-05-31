# kraken-transaction-downloader

Downloads all ETH/EUR transactions between two dates and saves to CSV file.

# Install

    npm install
    
# Run

First specify the interval for which you request the trading data. You do this by changing the `start_date` and `end_date` values at the top of the script.
Then, save the script and run:

    node main.js
    
If everything goes well, your data will be saved in `output.csv`.
