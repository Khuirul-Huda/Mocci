while true
do
    npm run deploy
    echo "Waiting 10 seconds before next restart... press CTRL+C to cancel"
    sleep 10
    clear
    echo "New Session"
done
