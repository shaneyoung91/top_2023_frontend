/* eslint-disable eqeqeq */
import Button from "../Button/Button";
import StatusBar from "../StatusBar/StatusBar";
import { useState, useEffect } from "react";
import SubmitButton from "../SubmitButton/SubmitButton";
import { Modal } from "flowbite-react";
import CardModal from "../Modal/CardModal";
import * as cardsAPI from "../../utilities/cards-api";
import "./QuestionCard.css";

function QuestionCard({
  text1,
  text2,
  text3,
  options,
  date,
  takeoutSpend,
  takeoutCost,
  nightOutSpend,
  nightOutCost,
  weekendSpend,
  weekendCost,
  popupPrompt,
  modalText,
  bannerImage,
  questionType,
  statusBarValue,
  changeQuestion,
  statementModalHeading1,
  statementModalHeading2,
  statementModal1,
  statementModal2,
}) {
  const [popUpText, setPopUpText] = useState(false);
  const [isGreen, setIsGreen] = useState(false);
  const [isFocused, setFocused] = useState();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const [cards, setCards] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [chosenCard, setChosenCard] = useState();
  const [cardAPR, setCardAPR] = useState([]);
  const [aprValues, setAprValues] = useState([]);

  const [spend, setSpend] = useState();
  const [totalBalance, setTotalBalance] = useState(0);
  const [payment, setPayment] = useState(null)

  const cardDescriptions = {
    "Poor-Fair":
      "This card is best suited for people with credit scores of 619 or less. This means that if you have a credit score of 619 or lower, you are most likely to get approved for this card.",
    Good: "This card is best suited for people with credit scores between 620-719. This means that if you have a credit score between 620-719, you are likely to get approved for this card.",
    Great:
      "This card is best suited for people with credit scores between 720 or greater. This means that if you have a credit score of 720 or higher, you are likely to get approved for this card.",
  };

  useEffect(function () {
    async function getCards() {
      const cards = await cardsAPI.getAll();
      setCards(cards);
    }

    getCards();
  }, []);

  useEffect(() => {
    if (questionType === 'none') {
      setIsGreen(true)
    }
  })

  useEffect(() => {
    let newTotal = 0;
    setTotalBalance(newTotal)
  }, [spend])

  useEffect(() => {
    if (['takeout', 'nightOut', 'weekend'].includes(spend)) {
      const costMap = {
        takeout: takeoutCost,
        nightOut: nightOutCost,
        weekend: weekendCost,
      };

      // Use reduce to sum the costs
      if (Array.isArray(costMap[spend])) {
        const newTotal = costMap[spend].reduce((acc, current) => acc + current, 0);
        setTotalBalance(newTotal);
      }
    }
  }, [spend, takeoutCost, nightOutCost, weekendCost]);

  console.log('totalbalance: ', totalBalance, typeof (totalBalance))

  const handleCreditSelect = (option) => {
    setSelectedOption(option);

    if (option === "Just getting started (0-619)") {
      const poorFairCards = cards.filter((card) => card.creditGroup != "Great");
      setSelectedCards(poorFairCards);

      const aprValues = poorFairCards.map((card) => card.apr["Poor-Fair"]);
      setAprValues(aprValues);
    } else if (option === "On it's way up (620-719)") {
      const goodCards = cards.filter((card) => card.creditGroup != "Great");
      setSelectedCards(goodCards);

      const aprValues = goodCards.map((card) => card.apr["Good"]);
      setAprValues(aprValues);
    } else if (option === "Pro status (720-850)") {
      const greatCards = cards.filter(
        (card) => card.creditGroup != "Poor-Fair"
      );
      setSelectedCards(greatCards);

      const aprValues = greatCards.map((card) => card.apr["Great"]);
      setAprValues(aprValues);
    }

    setCardAPR(aprValues);
  };

  const handleCardSelect = (option) => {
    if (option === "/cardOne.png" && selectedCards.length > 0) {
      const cardOne = selectedCards[0];
      setChosenCard(cardOne);
      setCardAPR(aprValues[0]);
      openModal();
    } else if (option === "/cardTwo.png" && selectedCards.length > 0) {
      const cardTwo = selectedCards[1];
      setChosenCard(cardTwo);
      setCardAPR(aprValues[1]);
      openModal();
    }
  };

  const handleSpend = (option) => {
    if (option === '$ Takeout & TV') {
      setSpend('takeout')
    } else if (option === '$$ Night out with friends') {
      setSpend('nightOut')
    } else if (option === '$$$ Weekend cabin getaway') {
      setSpend('weekend')
    }
    console.log("After setSpend, spend is:", spend);
  };

  const openModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent(null);
  };

  useEffect(() => {
    if (!!popupPrompt) {
      setPopUpText(true);
    } else {
      setPopUpText(false);
    }
  }, [popupPrompt]);

  function handleClick(id) {
    console.log("handleClick:", id);
    changeFocusColor(id);
    setIsGreen(true);
  }

  function changeFocusColor(id) {
    setFocused(id);
    console.log("focus State", isFocused);
  }

  function resetFocus() {
    setFocused(null);
  }

  let currentStyle = "";

  if (questionType == "regular") {
    currentStyle = "w-10/12 flex items-center flex-col gap-5";
  } else if (questionType == "twoImages") {
    currentStyle = "flex flex-row gap-5";
  } else if (questionType == "singleOption") {
    currentStyle = "w-10/12 flex items-center flex-col gap-5";
  } else if (questionType == 'pay-bill') {
    currentStyle = "w-10/12 flex gap-5"
  }


  const payBill = (option) => {
    console.log(typeof (totalBalance))
    if (option === 'Pay the minimum') {
      return '($35)'
    } else if (option === 'Pay the whole thing off') {
      return `($${totalBalance.toFixed(2)})`
    }
  }

  const handlePayment = (option) => {
    if (option === 'Pay the minimum') {
      setPayment('result-2')
    } else if (option === 'Pay the whole thing off') {
      setPayment('result-1')
    }
  }

  return (
    <div className="flex items-center h-screen w-full flex-col">
      {(questionType != "result-1" && questionType != "result-2") && (
        <StatusBar value={statusBarValue} />
      )}

      <div className="flex flex-col pt-10 pb-20 gap-10 items-center h-full w-full">
        {(questionType != "result-1" && questionType != "result-2") && (
          <div>
            <img src={bannerImage} alt="compass" className="mx-auto" />
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="w-3/4 text-lg text-center">{text1}</p>
              <p className="w-3/4 text-xl text-center font-bold">{text2}</p>
              <p className="w-3/4 text-lg text-center">{text3}</p>
            </div>
          </div>
        )}

        {(questionType === 'regular' || questionType === 'twoImages' || questionType === 'singleOption') && (
          <div className={currentStyle}>
            {options &&
              options.map((option, idx) => (
                <Button
                  key={idx}
                  text={option}
                  questionType={questionType}
                  handleClick={handleClick}
                  focusId={isFocused}
                  id={idx + 1}
                  handleCreditSelect={handleCreditSelect}
                  handleCardSelect={handleCardSelect}
                  handleSpend={handleSpend}
                />
              ))}
          </div>
        )}

        {/* Statement Page: */}
        {questionType === 'none' && (
          <div className="bg-gray-300 rounded-lg h-100 w-80 p-4">
            <p>Your Statement</p>
            {['takeout', 'nightOut', 'weekend'].includes(spend) && [0, 1, 2].map((_, i) => {
              const costMap = {
                takeout: takeoutCost,
                nightOut: nightOutCost,
                weekend: weekendCost,
              }
              const spendMap = {
                takeout: takeoutSpend,
                nightOut: nightOutSpend,
                weekend: weekendSpend
              }
              return (

                <div key={i} className="bg-white rounded-lg h-12 w-full mb-2 p-2 flex flex-col justify-around">
                  <div className="flex justify-between">
                    <span>{date}</span>
                    <span>${costMap[spend] ? costMap[spend][i] : ''}</span>
                  </div>
                  <span className="text-left">{spendMap[spend] ? spendMap[spend][i] : ''}</span>
                </div>
              )
            })}
            <br />
            <div className="bg-white rounded-lg h-12 w-full mb-2 p-2 flex flex-col justify-around">
              <p>Total Balance: ${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        )}

        {questionType === 'pay-bill' && (
          <>
            <p>Total Balance: ${totalBalance.toFixed(2)}</p>
            <div className={currentStyle}>
              {options &&
                options.map((option, idx) => (
                  <Button className='flex-col'
                    key={idx}
                    text={option}
                    subText={payBill(option, totalBalance.toFixed(2))}
                    questionType={questionType}
                    handleClick={handleClick}
                    focusId={isFocused}
                    id={idx + 1}
                    handleCreditSelect={handleCreditSelect}
                    handleCardSelect={handleCardSelect}
                    handleSpend={handleSpend}
                    handlePayment={handlePayment} 
                  />
                ))}
            </div>
          </>
        )}

        {/* Popup Text */}
        {(questionType != "result-1" && questionType != "result-2") && (
          <div className="flex flex-col justify-center items-center gap-10">
            {popUpText && (
              <div
                className="flex justify-center items-center gap-2"
                onClick={() => {
                  openModal(<CardModal content={modalText} />);
                }}
              >
                {questionType != 'twoImages' && (
                  <img
                    src="/icon.png"
                    width={15}
                    style={{ height: 15 }}
                    alt="I icon"
                  />
                )}
                <p className="text-xs text-gray-500">{popupPrompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {(questionType != "result-1" && questionType != "result-2") && (
          <SubmitButton
            text={"Onward"}
            resetFocus={resetFocus}
            changeQuestion={changeQuestion}
            handleGreen={setIsGreen}
            isGreen={isGreen}
            isActive={questionType === 'none'}
            payment={payment}
          />
        )}

        {/* "Pay Whole Thing Off" Page */}
        {(questionType === "result-1") && (
          <div className="flex flex-col items-center justify-center">
            <div>
              <p className="results">{text1}</p>
              <p className="trail-blazer">{text2}</p>
              <br />
              <img src={bannerImage} alt="compass" className="mx-auto yay" />
              <br />
              <p className="sub-text">{text3}</p>
            </div>
            <br />

            {/* Popup Text #1: Result-1 */}
            <div className="flex flex-col justify-center items-center gap-10">
              {popUpText && (
                <div
                  className="flex justify-center items-center gap-2"
                  onClick={() => {
                    openModal(<CardModal content={modalText} />);
                  }}
                >
                  <img src="/purple-icon.png" width={15} style={{ height: 15 }} alt="I icon" />
                  <p className="popup-1">{popupPrompt[0]}</p>
                </div>
              )}
            </div>

            <br />
            <br />
            <br />

            <div className="frame-2 flex flex-col items-center justify-center">
              <br />
              <br />
              <p className="conquer">You’ve conquered your credit score!</p>
              <br />
              <p className="tip-1">Keep using your card wisely to earn credit and unlock future investments like buying a car or home. Keep that score up!</p>
              <br />

              {/* Popup Text #2: Result-1 */}
              <div className="flex flex-col justify-center items-center gap-10">
                {popUpText && (
                  <div
                    className="flex justify-center items-center gap-2"
                    onClick={() => {
                      openModal(<CardModal content={modalText} />);
                    }}
                  >
                    <img src="/purple-icon.png" width={15} style={{ height: 15 }} alt="I icon" />
                    <p className="popup-1">{popupPrompt[1]}</p>
                  </div>
                )}
              </div>

              <img src="/mountain.png" alt="mountain" className="mx-auto p-10" />
              <p className="tip-1">Some months we navigate tougher terrain. Want to see what you’d owe if you didn’t pay your full bill?</p>

              {/* Popup Text #3: Result-1 */}
              <div className="flex flex-col justify-center items-center gap-10 pb-6">
                {popUpText && (
                  <div
                    className="flex justify-center items-center gap-2"
                    onClick={() => {
                      openModal(<CardModal content={modalText} />);
                    }}
                  >
                    <img src="/purple-icon.png" width={15} style={{ height: 15 }} alt="I icon" />
                    <p className="popup-1">{popupPrompt[2]}</p>
                  </div>
                )}
              </div>
              <br />
              <SubmitButton
                text={"Take the quiz again"}
                resetFocus={resetFocus}
                changeQuestion={changeQuestion}
                handleGreen={setIsGreen}
                isGreen={!isGreen}
                isActive={questionType === 'none'}
              />
              <br />
              <SubmitButton
                text={"Explore glossary"}
                resetFocus={resetFocus}
                changeQuestion={changeQuestion}
                handleGreen={setIsGreen}
                isGreen={!isGreen}
                isActive={questionType === 'none'}
              />
              <br />
              <SubmitButton
                text={"Choosing a card"}
                resetFocus={resetFocus}
                changeQuestion={changeQuestion}
                handleGreen={setIsGreen}
                isGreen={!isGreen}
                isActive={questionType === 'none'}
              />
              <br />
            </div>

          </div>
        )}

        {/* "Pay Minimum" Page PLACEHOLDER */}
        {(questionType === "result-2") && (
          <div className="flex flex-col items-center justify-center">
            <div>
              <p className="results">{text1}</p>
              <p className="trail-blazer">{text2}</p>
             
              <p className="sub-text">{text3}</p>
            </div>
            <br />

            {/* Popup Text #1: Result-1 */}
           
          </div>
        )}

      </div>

      {modalVisible && (
        <div className="flex flex-wrap gap-4">
          <Modal dismissible show={modalVisible} onClose={closeModal}>
            <div className="custom-modal">
              <Modal.Header className="modal-header">

                {(questionType === "regular" || questionType === "none" || questionType === "result-1") && (
                  <img src="/question-mark.png" alt="question-mark logo" />
                )}

                {questionType === "twoImages" && chosenCard && (
                  <img
                    src={
                      aprValues[0] === cardAPR ? "/cardOne.png" : "/cardTwo.png"
                    }
                    alt={aprValues[0] === cardAPR ? "card-one" : "card-two"}
                    style={{ width: 75 }}
                  />
                )}

                {questionType === "pay-bill" && (
                  <img src="/exclamation.png" alt="exclamation-mark logo" />
                )}

                <span>
                  {questionType === "regular" && [popupPrompt]}
                  {(questionType === "none" || questionType === "pay-bill") && [statementModalHeading1]}
                  {questionType === "twoImages" &&
                    (aprValues[0] === cardAPR ? "Card One" : "Card Two"
                    )}
                </span>

              </Modal.Header>
              <Modal.Body>

                {(questionType === "regular" || questionType === "pay-bill") && (
                  <div className="modal-body-regular">
                    <p>{modalText ? modalText[0] : ''}</p><br />
                    <p>{modalText ? modalText[1] : ''}</p><br />
                    <p>{modalText ? modalText[2] : ''}</p>
                  </div>
                )}

                {questionType === "twoImages" && chosenCard && chosenCard.name && (
                  <div className="modal-body-twoImages">
                    <p>APR: {(cardAPR * 100).toFixed(1)}%</p>
                    <p>Late Fee: ${chosenCard.lateFee}</p>
                    <p>Grace Period: {chosenCard.gracePeriod} days</p>
                    <p>Rewards: {chosenCard.rewards}</p>
                    <br />
                    <p>{cardDescriptions[chosenCard.creditGroup]}</p>
                  </div>
                )}

                {questionType === "none" && (
                  <div className="modal-body-regular">
                    <p>{statementModal1 ? statementModal1 : ''}</p><br />
                    <p style={{ fontSize: "1.3rem", fontWeight: "600" }}>{statementModalHeading2 ? statementModalHeading2 : ''}</p><br />
                    <p>{statementModal2 ? statementModal2 : ''}</p>
                  </div>
                )}

                {(questionType === "result-1") &&
                  (popupPrompt[0] === 'What does that mean?') && (
                    <div className="modal-body-regular">
                      <p>{modalText ? modalText[0] : ''}</p>
                    </div>
                  )}

                {(questionType === "result-1") &&
                  (popupPrompt[1] === 'Tell me more') && (
                    <div className="modal-body-regular">
                      <p>{modalText ? modalText[1] : ''}</p>
                    </div>
                  )}

                {(questionType === "result-1") &&
                  (popupPrompt[2] === 'Show me!') && (
                    <div className="modal-body-regular">
                      <p>{modalText ? modalText[2] : ''}</p>
                      <p>{modalText ? modalText[3] : ''}</p><br />
                      <p>{modalText ? modalText[4] : ''}</p>
                    </div>
                  )}

              </Modal.Body>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
