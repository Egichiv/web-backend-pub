document.addEventListener("DOMContentLoaded", function () {

    const amountInput = document.getElementById("amount");
    const currencySelect = document.getElementById("currency");
    const resultDiv = document.getElementById("result");

    let currentPrice = null;

    async function fetchPrice() {
        resultDiv.innerHTML = "Ждем-с...";
        const symbol = currencySelect.value + "USDT";

        const apiResponse = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`);
        const dataJson = await apiResponse.json();

        if (dataJson.price) {
            currentPrice = parseFloat(dataJson.price);
            calculateAndDisplay();
        } else {
            resultDiv.innerHTML = "Чота ошибка при получении данных :(";
        }
    }

    function calculateAndDisplay() {
        if (currentPrice !== null) {
            const amount = parseFloat(amountInput.value);
            const convertedValue = (amount * currentPrice).toFixed(2);
            resultDiv.innerHTML = `<strong>${amount} ${currencySelect.value}</strong> = <strong>${convertedValue} USD</strong>`;
        }
    }

    currencySelect.addEventListener("change", fetchPrice);
    amountInput.addEventListener("input", calculateAndDisplay);

    fetchPrice();
});