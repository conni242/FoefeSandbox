import { LightningElement, track, wire } from 'lwc';
import getCampList from '@salesforce/apex/anmeldeformularController.getCampList';
import createLead from '@salesforce/apex/anmeldeformularController.createLead';
export default class Anmeldeformular extends LightningElement {

    // Process Variables 
    @track step = 0;
    @track filteredCampList = [];
    @track selectedType;

    // inputs from User
    @track selectedCamp;
    @track selectedPrice;
    @track firstName ='';
    @track lastName ='';
    @track gender;
    @track birthdate ='';
    @track addressStreet ='';
    @track addressPostalCode ='';
    @track addressCity ='';
    @track addressCountry ='';

    @track passportNumber ='';
    @track nationality ='';
    @track placeOfBirth ='';

    @track firstNameParent ='';
    @track lastNameParent ='';
    @track landkreis ='';
    @track validMail = false; 
    @track email ='';
    @track phone ='';
    @track mobil ='';

    @track travelStartLocation;
    @track isSwimmer;
    @track comments ='';
    @track shippingDocuments;
    @track knownFrom;

    @track agreedToAGB = false;
    @track agreedToFormblatt = false;
    @track agreedDataPrivacy = false;

    /*****************************************************************************************************************************************************************************
        * 
        * Load data from Salesforce 
        * 
        ******************************************************************************************************************************************************************************/

    @track camplist = [];
    @track priceTypes = ["Ermäßigter Preis", "Normalpreis", "Unterstützerpreis"];

    get startLocationOptionList() { 
        let locationList = (this.selectedCamp) ? this.selectedCamp.Anreisem_glichkeiten__c.split(';'):[];  
        return locationList;
    }
    @wire(getCampList)
    wiredCamps({ error, data }) {
        if (data) {
            this.camplist = JSON.parse(data);
            console.log('data' + JSON.stringify(this.camplist));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.contacts = undefined;
            console.log('error' + JSON.stringify(this.error));
        }
    }
    get campTypes() {
        let res = [... new Set(this.camplist.map(camp => camp.Type))];
        console.log(res);
        return res;
    }

    /*****************************************************************************************************************************************************************************
        * 
        * Save Booking in Salesforce 
        * 
        ******************************************************************************************************************************************************************************/

       saveToSalesforce() {
        const inputParams = ({
            'selectedCamp': this.selectedCamp.Id,
            'selectedPrice': this.selectedPrice,
            'firstName': this.firstName,
            'lastName': this.lastName,
            'gender': this.gender,
            'birthdate': this.birthdate, 
            'addressStreet': this.addressStreet, 
            'addressPostalCode': this.addressPostalCode, 
            'addressCity': this.addressCity, 
            'addressCountry': this.addressCountry, 
            'passportNumber': this.passportNumber, 
            'nationality': this.nationality, 
            'placeOfBirth': this.placeOfBirth, 
            'firstNameParent': this.firstNameParent, 
            'lastNameParent': this.lastNameParent, 
            'email': this.email, 
            'phone': this.phone, 
            'mobil': this.mobil, 
            'travelStartLocation': this.travelStartLocation, 
            'landkreis': this.landkreis, 
            'isSwimmer': (this.isSwimmer)?'Ja':'Nein', 
            'comments': this.comments, 
            'shippingDocuments': this.shippingDocuments, 
            'knownFrom': this.knownFrom
        });
        console.log('Params:' + JSON.stringify(inputParams))
        // call the server to save data
        createLead({ "requestString": JSON.stringify(inputParams) })
            .then(resultStr => {
                if (!resultStr == "success") {
                    console.log('Error while success'); 
                } else {
                    alert('success!!!'); 
                }
            })
            .catch((error) => {
                 // eslint-disable-next-line
                console.log('Error while saving! Code: ' + JSON.stringify(error));
            });
    }

    /*****************************************************************************************************************************************************************************
       * 
       * Category functions 
       * 
       ******************************************************************************************************************************************************************************/
    get showCategory() {
        return (this.step === 0);
    }
    get hasCategory() {
        let response = false;
        if (this.selectedType) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setCategory(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.selectedType) {
            this.selectedType = incomingType;
            this.updateBoxStyle(event, ".z-category", true);
            this.filterCampsByCategory();
            this.selectedCamp = null;
            this.selectedPrice = null;
            //this.template.querySelector(".camp-section").scrollIntoView({behavior: "smooth",block:"center"});  
        }
    }
    filterCampsByCategory() {
        this.filteredCampList = this.camplist.filter(camp => camp.Type == this.selectedType);
    }


    /*****************************************************************************************************************************************************************************
     * 
     * Camp functions 
     * 
     ******************************************************************************************************************************************************************************/
    get showCamps() {
        return (this.step === 1);
    }
    get hasCamp() {
        let response = false;
        if (this.selectedCamp) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setCamp(event) {
        let status = event.currentTarget.getAttribute("data-status");
        if (status != "Ausgebucht" && status != "Bald wieder verfügbar") {
            this.selectedCamp = this.camplist.find(camp => camp.Id == event.currentTarget.getAttribute("data-value"));
            console.log(this.selectedCamp)
            this.selectedPrice = null;
            this.updateBoxStyle(event, ".z-camp", true);
            this.updateBoxStyle(event, ".z-price", false);
        }
    }

    /*****************************************************************************************************************************************************************************
   * 
   * Price functions 
   * 
   ******************************************************************************************************************************************************************************/
    get showPrices() {
        return (this.step === 2);
    }
    get hasPrice() {
        let response = false;
        if (this.selectedPrice) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setPrice(event) {
        this.selectedPrice = event.currentTarget.getAttribute("data-value");
        this.updateBoxStyle(event, ".z-price", true);
    }
    get discountedPrice() {
        return this.selectedCamp.Erm_igter_Preis__c;
    }
    get regularPrice() {
        return this.selectedCamp.Normalpreis__c;
    }
    get supporterPrice() {
        return this.selectedCamp.Unterst_tzerpreis__c;
    }
    /*****************************************************************************************************************************************************************************
         * 
         * startLocation functions 
         * 
         ******************************************************************************************************************************************************************************/
    get showStartLocation() {
        return (this.step === 3);;
    }
    get hasStartLocation() {
        let response = false;
        if (this.travelStartLocation) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }

    setStartLocation(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.travelStartLocation) {
            this.travelStartLocation = incomingType;
            this.updateBoxStyle(event, ".z-startlocation", true);
        }
    }
    /*****************************************************************************************************************************************************************************
         * 
         * startLocation functions 
         * 
         ******************************************************************************************************************************************************************************/
    get showParticipant() {
        return (this.step === 4);
    }
    get hasParticipant() {
        let response = false;
        if (this.birthdate && this.lastName && this.firstName && this.gender) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    get passportRequired() {
        return (this.selectedCamp) ? this.selectedCamp.Ausweisdaten_erforderlich__c : false;
    }
    setGender(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.gender) {
            this.gender = incomingType;
            this.updateBoxStyle(event, ".z-gender", true);
            this.removeForceHover(".z-gender");
        }
    }
    setFirstName(event) {
        this.firstName = event.currentTarget.value;
    }
    setLastName(event) {
        this.lastName = event.currentTarget.value;
    }
    setBirthdate(event) {
        if (event.currentTarget.checkValidity()) {
            this.birthdate = event.currentTarget.value;
        }
    }
    /*****************************************************************************************************************************************************************************
     * 
     * Ferry functions 
     * 
     ******************************************************************************************************************************************************************************/
    get showFerry() {
        return (this.step === 5);
        //return (this.hasParticipant && this.passportRequired); // here some more condition if required 
    }

    get hasFerry() {
        let response = false;
        if (this.nationality && this.placeOfBirth && this.passportNumber) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setNationality(event) {
        this.nationality = event.currentTarget.value;
    }
    setBirthLocation(event) {
        this.placeOfBirth = event.currentTarget.value;
    }
    setPassportNumber(event) {
        this.passportNumber = event.currentTarget.value;
    }
    /*****************************************************************************************************************************************************************************
    * 
    * Parent functions 
    * 
    ******************************************************************************************************************************************************************************/
    get showParent() {

        return (this.step === 6);
    }
    get hasParent() {
        let response = false;
        if (this.firstNameParent && this.lastNameParent && this.addressStreet && this.addressPostalCode && this.addressCity && this.addressCountry && this.landkreis) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setParentFirstName(event) {
        this.firstNameParent = event.currentTarget.value;
    }
    setParentLastName(event) {
        this.lastNameParent = event.currentTarget.value;
    }
    setParentStreet(event) {
        this.addressStreet = event.currentTarget.value;
    }
    setParentPostalCode(event) {
        this.addressPostalCode = event.currentTarget.value;
    }
    setParentCity(event) {
        this.addressCity = event.currentTarget.value;
    }
    setParentCountry(event) {
        this.addressCountry = event.currentTarget.value;
    }
    setParentDistrict(event) {
        this.landkreis = event.currentTarget.value;
    }
    /*****************************************************************************************************************************************************************************
  * 
  * Contact functions 
  * 
  ******************************************************************************************************************************************************************************/
    get showContact() {

        return (this.step === 7);
    }
    get hasContact() {
        let response = false;
        this.validMail = (this.template.querySelector(".mailInput")) ? this.template.querySelector(".mailInput").checkValidity() : false; 
        if (this.validMail && this.phone && this.mobil) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setEmail(event) {
            this.email = event.currentTarget.value;
    }
    setPhone(event) {
        this.phone = event.currentTarget.value;
    }
    setMobilePhone(event) {
        this.mobil = event.currentTarget.value;
    }
    /*****************************************************************************************************************************************************************************
   * 
   * Comment functions 
   * 
   ******************************************************************************************************************************************************************************/

    get showComment() {

        return (this.step === 8);
    }
    get hasComment() {

        let response = false;
        if (this.shippingDocuments && this.isSwimmer) {
            this.navigateForwardLock(false);
            response = true;
        }
        return response;
    }
    setSwim(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.isSwimmer) {
            this.isSwimmer = incomingType;
            this.updateBoxStyle(event, ".z-swim", true);
            this.removeForceHover(".z-swim");
        }
    }
    setDocument(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.shippingDocuments) {
            this.shippingDocuments = incomingType;
            this.updateBoxStyle(event, ".z-document", true);
            this.removeForceHover(".z-document");
        }
    }
    setComments(event) {
        this.comments = event.currentTarget.value;
    }

    /*****************************************************************************************************************************************************************************
   * 
   * submit functions 
   * 
   ******************************************************************************************************************************************************************************/
    get showSubmit() {
        return (this.step === 9);
    }
    get hasSubmit() {
        return (this.agreedDataPrivacy && this.agreedToAGB && this.agreedToFormblatt);
    }

    setAgb(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.agreedToAGB) {
            this.agreedToAGB = incomingType;
            this.updateBoxStyle(event, ".z-agb", true);
            this.removeForceHover(".z-agb");
            console.log("AGB: " + this.agreedToAGB)

        }
    }
    setPrivacy(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.agreedDataPrivacy) {
            this.agreedDataPrivacy = incomingType;
            this.updateBoxStyle(event, ".z-privacy", true);
            this.removeForceHover(".z-privacy");
            console.log("privacy: " + this.agreedDataPrivacy);
        }
    }
    setFormblatt(event) {
        let incomingType = event.currentTarget.getAttribute("data-value");
        if (incomingType != this.agreedToFormblatt) {
            this.agreedToFormblatt = incomingType;
            this.updateBoxStyle(event, ".z-formblatt", true);
            this.removeForceHover(".z-formblatt");
            console.log("Formblatt: " + this.agreedToFormblatt);
        }
    }

    /*****************************************************************************************************************************************************************************
     * 
     * Transition functions 
     * 
     ******************************************************************************************************************************************************************************/
    get showTransition() {
        return (this.hasComment);
    }
    navigateBack() {
        if (this.step >= 1) {
            this.step = (this.step == 6 && !this.selectedCamp.Ausweisdaten_erforderlich__c) ? this.step - 2 : this.step - 1;
        }
        this.navigateBackVisibilty();
    }
    navigateForward() {
        if (this.isValidStep(this.step)) {
            this.step = (this.step == 4 && !this.selectedCamp.Ausweisdaten_erforderlich__c) ? this.step + 2 : this.step + 1;
            this.navigateForwardLock(true);
        }
        this.navigateBackVisibilty();
    }
    navigateBackVisibilty() {
        let navBack = this.template.querySelector(".c-navBack");
        if (this.step <= 0) {
            navBack.classList.add("c-fadedNav");
        } else {
            navBack.classList.remove("c-fadedNav");
        }
    }
    navigateForwardLock(bool) {
        let navForw = this.template.querySelector(".c-navForward");
        if (bool) {
            navForw.classList.add("c-fadedNav");
        } else {
            navForw.classList.remove("c-fadedNav");
        }
    }

    /*****************************************************************************************************************************************************************************
     * 
     * Support Functions 
     * 
     ******************************************************************************************************************************************************************************/
    updateBoxStyle(event, classs, setEventActive) {
        let cards = this.template.querySelectorAll(classs);
        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.remove("c-selected");
        }
        if (setEventActive) {
            event.currentTarget.classList.add("c-selected");
        }
    }
    removeForceHover(classs) {
        let cards = this.template.querySelectorAll(classs);
        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.remove("forceHover");
        }
    }

    isValidStep(step) {
        let isValid = this.hasSubmit;
        switch (step) {
            case 0:
                isValid = this.hasCategory;
                break;
            case 1:
                isValid = this.hasCamp;
                break;
            case 2:
                isValid = this.hasPrice;
                break;
            case 3:
                isValid = this.hasStartLocation;
                break;
            case 4:
                isValid = this.hasParticipant;
                break;
            case 5:
                isValid = this.hasFerry;
                break;
            case 6:
                isValid = this.hasParent;
                break;
            case 7:
                isValid = this.hasContact;
                break;
            case 8:
                isValid = this.hasComment;
                break;
            case 9:
                isValid = this.hasSubmit;
                break;
        }
        console.log("valid: " + this.isValid);
        return isValid;
    }

}