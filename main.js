

const allForms = document.querySelectorAll('[data-step]')


let currentPage = 0
const monthlyAddonRate = ['1/mo', '2/mo', '2/mo']
const yearlyAddonRate = ['10/yr', '20/yr', '20/yr']


// Create an object of the order
const transactionList = []
const transaction = {}



const createErrorMessage = (node) => {
    node = node.closest('.input-container').querySelector('.error-state')
    return node
}

const isValidExp = (regExp, node, errorMsg) => {
    const errorMsgSpan = createErrorMessage(node)
    //If it is not a valid regular expression
    if (!regExp.test(node.value)) {
        //Create a span error
        if (!node.value) {
            errorMsgSpan.textContent = "This field is required"
        }
        else {
            errorMsgSpan.textContent = errorMsg
        }
        node.style.outline = '1px solid var(--primary-strawberry-red)'
        node.style.border = '0'
        return false
    }
    //If it is a valid regular expression
    else {
        errorMsgSpan.textContent = ''

        node.style.outline = '1px solid var(--primary-purplish-blue)'
        node.style.border = '0'
        return true
    }
}

const createSummary = (form) => {
    // Summary form
    const summary = form.querySelector('.summary-container')
    // Term (Monthly or Yearly)
    const summaryTerm = summary.querySelector('[data-summary-term]')
    summaryTerm.textContent = `${transaction.plan.selectedPlan} (${transaction.term})`
    // Rate ($9/mo or $90/yr)
    const summaryPlanRate = summary.querySelector('[data-summary-plan-rate]')
    summaryPlanRate.textContent = `$${transaction.plan.planRate}/${transaction.plan.planTerm}`
    // Addons
    const summaryAddons = summary.querySelector('.user-addon-container')
    let addonTotalPrice = 0
    summaryAddons.innerHTML = ''
    transaction.addons.forEach(addon => {
        const HTMLstring = `<div class="summary-addon">
                                <span>${addon.Description}</span>
                                <span data-summary-addon-rate>+$${addon.rate}/${addon.term}</span>
                            </div>`
        summaryAddons.insertAdjacentHTML('beforeend', HTMLstring)
        addonTotalPrice = addonTotalPrice + parseInt(addon.rate)
    });

    const totalPriceContainer = form.querySelector('.total-price-container')
    const totalPrice = parseInt(transaction.plan.planRate) + addonTotalPrice

    let totalPriceString
    totalPriceContainer.innerHTML = ''
    if (transaction.term === 'Monthly') {
        totalPriceString = `<span>Total <span>(per month)</span></span>
                            <span>$${totalPrice}/mo</span>`
    }
    else if (transaction.term === 'Yearly') {
        totalPriceString = `<span>Total <span>(per syear)</span></span>
                            <span>$${totalPrice}/yr</span>`
    }

    totalPriceContainer.insertAdjacentHTML('beforeend', totalPriceString)
}

const splitStringTerm = (input) => {
    const parts = input.split('/')

    const moneyValue = parts[0]
    const termValue = parts[1]

    return { moneyValue, termValue }
}


const isAllTrue = []

const isFormComplete = (form) => {

    // Switch case
    // Form 1, Form 2. etc
    switch (parseInt(form.dataset.step)) {
        case 0:
            let isInputsCorrect = []

            const nameInput = form.querySelector('#name')
            const emailInput = form.querySelector('#email')
            const phoneInput = form.querySelector('#phone')


            //Regular Expressions
            const nameRegExp = /^[A-Za-z\s]{3,}$/
            const emailExp = /^([a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)$/g
            const telephoneExp = /^\d{11}$/

            //Error Message
            const errorMsg = "Please enter a valid name"
            const emailErrorMsg = "Please enter a valid email address"
            const telephoneMsg = "Please enter a valid Phone number"


            isInputsCorrect.push(isValidExp(nameRegExp, nameInput, errorMsg))
            isInputsCorrect.push(isValidExp(emailExp, emailInput, emailErrorMsg))
            isInputsCorrect.push(isValidExp(telephoneExp, phoneInput, telephoneMsg))

            // If all inputs are correct, store in an object
            if (isInputsCorrect.every(input => input == true)) {
                transaction.name = nameInput.value
                transaction.email = emailInput.value
                transaction.phone = phoneInput.value
                isAllTrue[0] = true
            }

            break
        case 1:
            // Select inputs and check for the selected value
            const termPlanRadio = form.querySelectorAll('input[type="radio"]')
            let selectedPlan
            let selectedPlanRate
            termPlanRadio.forEach(element => {
                if (element.checked) {
                    selectedPlan = element.value
                    selectedPlanRate = element.closest('label').querySelector('[data-plan-rate]').dataset.planRate
                }
            });
            // Checkbox for term type
            // Yearly if checked, Monthly if unchecked
            const termTypeContainer = form.querySelector('input[type="checkbox"')
            let termType
            termTypeContainer.checked
                ? termType = 'Yearly'
                : termType = 'Monthly'
            const result = splitStringTerm(selectedPlanRate)

            const localScopeObject = {
                selectedPlan: selectedPlan,
                planRate: result.moneyValue,
                planTerm: result.termValue
            }
            transaction.plan = localScopeObject
            transaction.term = termType
            if (selectedPlan)
                isAllTrue[1] = true
            else
                isAllTrue[1] = false
            break
        case 2:
            // Addons form, can be empty
            const addonsContainer = form.querySelectorAll('input[name="addon"]')
            const selectedAddons = []

            addonsContainer.forEach(addon => {
                if (addon.checked) {
                    // Split addon string; 90/yr '90' and 'yr'
                    const rate = addon.closest('.addon-option').querySelector('[data-addon-rate]').dataset.addonRate
                    const result = splitStringTerm(rate)

                    // Store to an object and push it to the array
                    const localScopeObject = {
                        Description: addon.dataset.desc,
                        value: addon.value,
                        rate: result.moneyValue,
                        term: result.termValue,
                    }
                    selectedAddons.push(localScopeObject)
                }
            })
            transaction.addons = selectedAddons
            break


    }

    if (isAllTrue.length !== 0 && isAllTrue.every(input => input == true)) {
        return true
    }
    else {
        return false
    }
}

// all sidebar icons
const sidebarIcons = document.querySelectorAll('[data-step-i]')
// Change form
const changeForm = (previousPage, pageHeaded) => {
    allForms[previousPage].style.display = 'none'
    allForms[pageHeaded].style.display = 'flex'

    sidebarIcons[previousPage].classList.remove('active-state')
    if (sidebarIcons[pageHeaded])
        sidebarIcons[pageHeaded].classList.add('active-state')
}

// Event Listener that changes form upon interacted
const pageButton = document.querySelectorAll(['[data-page]'])
const previousButton = document.querySelector('[data-page="prev"]')
const nextButton = document.querySelector('[data-page="next"]')
const confirmButton = document.querySelector('[data-page="confirm"]')
pageButton.forEach(button => {
    button.addEventListener('click', () => {
        let previousPage = currentPage
        switch (button.dataset.page) {
            case 'prev':
                currentPage -= 1
                confirmButton.style.display = 'none'
                nextButton.style.display = 'block'
                // If it's the first page, hide button
                if (currentPage === 0) {
                    previousButton.style.display = 'none'
                    currentPage = 0
                }
                changeForm(previousPage, currentPage)
                break
            case 'next':
                // Everytime a form is submitted, check its contents
                // Make a function that checks the contents and return boolean

                // If next page is summary
                // Create summary before going next page

                let isComplete = isFormComplete(allForms[currentPage])

                if (currentPage + 1 == 3) {
                    createSummary(allForms[currentPage + 1])
                }
                if (!isComplete) {
                    console.log("Form not complete")
                }
                else {
                    // Display previous button
                    currentPage += 1
                    previousButton.style.display = 'block'
                    // If it's the last page, replace with confirm button
                    if (currentPage === allForms.length - 2) {
                        nextButton.style.display = 'none'
                        confirmButton.style.display = 'block'
                    }
                    changeForm(previousPage, currentPage)
                }
                break
            case 'confirm':
                currentPage += 1
                changeForm(previousPage, currentPage)
                // Hide buttons
                pageButton.forEach(button => button.style.display='none')
                // Save transaction to localStorage
                if (!localStorage.getItem('transactions')) {
                    console.log("Newly created")
                    transactionList.push(transaction)
                    localStorage.setItem('transactions', JSON.stringify(transactionList))
                }
                else {
                    console.log("It exists")
                    let local = JSON.parse(localStorage.getItem('transactions'))
                    console.log(local)
                    local.push(transaction)
                    localStorage.setItem('transactions', JSON.stringify(local))
                }
                console.log(JSON.parse(localStorage.getItem('transactions')))
                break
        }
    })
})




// Actives active-query class
const inputRadioPlan = document.querySelectorAll('input[name="plan_type"]')
inputRadioPlan.forEach(radioPlan => {
    radioPlan.addEventListener('click', () => {
        inputRadioPlan.forEach(radioPlan => {
            radioPlan.closest('LABEL').classList.remove('active-query')
            if (radioPlan.checked) {
                radioPlan.closest('LABEL').classList.add('active-query')
            }
        })
    })
});

// Dispatch once
// Because firefox does not reset checked value, a "just in case" for other browsers
inputRadioPlan.forEach(radioPlan => {
    radioPlan.dispatchEvent(new Event('click'), { once: true })
})


// Addons
const allAddons = document.querySelectorAll('input[name="addon"]')
allAddons.forEach(addon => {
    addon.addEventListener('click', () => {
        if (addon.checked)
            addon.closest('.addon-option').classList.add("active-addon")

        else
            addon.closest('.addon-option').classList.remove("active-addon")
    })
})


// Dispatch once
allAddons.forEach(addon => {
    addon.dispatchEvent(new Event('click'), { once: true })
})

// Term: Monthly or Yearly
const billingTerm = document.querySelector('input[name="billing_term"]')
billingTerm.addEventListener('click', () => {
    const planRates = document.querySelectorAll('[data-plan-rate]')
    const termInlines = document.querySelectorAll('.term-inline')
    // Yearly
    if (billingTerm.checked) {
        planRates[0].dataset.planRate = '90/yr'
        planRates[1].dataset.planRate = '120/yr'
        planRates[2].dataset.planRate = '150/yr'
        termInlines[0].classList.remove('active-term')
        termInlines[1].classList.add('active-term')
        planRates.forEach(planRate => {
            planRate.closest('.rate-container').insertAdjacentHTML('beforeend', '<div class="extra-months">2 months free</div>')
        })

        // Change data attribute based on array
        // yearlyAddonRate/monthlyAddonRate
        for (let index = 0; index < allAddons.length; index++) {
            allAddons[index].closest('.addon-option').querySelector('.addon-rate').dataset.addonRate = yearlyAddonRate[index]
            const addon = allAddons[index].closest('.addon-option').querySelector('.addon-rate').dataset.addonRate
            allAddons[index].closest('.addon-option').querySelector('.addon-rate').textContent = `+$${addon}`
        }

    } // Monthly
    else {
        planRates[0].dataset.planRate = '9/mo'
        planRates[1].dataset.planRate = '12/mo'
        planRates[2].dataset.planRate = '15/mo'
        termInlines[1].classList.remove('active-term')
        termInlines[0].classList.add('active-term')
        planRates.forEach(planRate => {
            const removeElement = planRate.closest('.rate-container').querySelector('.extra-months')
            if (removeElement)
                removeElement.remove()
        })

        // Change data attribute based on array
        // yearlyAddonRate/monthlyAddonRate
        for (let index = 0; index < allAddons.length; index++) {
            allAddons[index].closest('.addon-option').querySelector('.addon-rate').dataset.addonRate = monthlyAddonRate[index]
            const addon = allAddons[index].closest('.addon-option').querySelector('.addon-rate').dataset.addonRate
            allAddons[index].closest('.addon-option').querySelector('.addon-rate').textContent = `+$${addon}`
        }
    }
    planRates.forEach(planRate => {
        planRate.textContent = `$${planRate.dataset.planRate}`
    })
})


//Dispatch once
billingTerm.dispatchEvent(new Event('click'), { once: true })


// If on summary container, user wants to change
const changeButton = document.querySelector(".change-term")
changeButton.addEventListener('click', () => {
    currentPage = 1
    confirmButton.style.display = 'none'
    nextButton.style.display = 'block'
    // Summary Page to Plan Page
    changeForm(3, currentPage)
})