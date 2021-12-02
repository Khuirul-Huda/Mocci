while true
do
    npm run deploy
    echo "Waiting 60 seconds before next restart... press CTRL+C to cancel"
    sleep 60
    clear
    echo "New Session"
done
