let searchButton = document.getElementById('search-button');
let searchField = document.getElementById('search-name');
let searchName;
let objectID;

window.addEventListener('load', () => {
    console.log('Page is loaded');

    // Disable search button if input field is empty
    // if (!document.getElementById('search-name').value) {
    //     searchButton.className += " " + disabled;
    // }

    // When input field has something in it, add right arrow arrow to search button
    searchField.addEventListener('input', () => {
        if (document.getElementById('search-name').value) {
            searchButton.innerHTML = 'Find Out →';
        } else {
            searchButton.innerHTML = 'Find Out';
        }
    });

    // CAN FINALLY PRESS ENTER TO SEARCH!!! https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
    // Execute a function when the user presses a key on the keyboard
    searchField.addEventListener("keypress", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            searchButton.click();
        }
    });


    // When button pressed, make searchName the input value of the field
    searchButton.addEventListener('click', () => {
        searchName = document.getElementById('search-name').value;
        console.log(searchName);

        // loading();


        // objectID = getObjectID();
        // console.log(objectID);

        getObjectID(searchName)
            .then((id) => {
                console.log(id);
                if (id) {
                    getObjectInfo(id);
                } else {
                    console.log('No matching objects found.');
                    displayNoMatchMessage(searchName);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    });

});

// Rewriting this function to search for title, then artist, then tags, always with images
// Thanks Eric for the original idea of a helper function to run the search
async function getObjectID(searchName) {

    // Order is hasImages, title, artistOrCulture, tags

    // All objects matching title
    const data = await searchArtworks(true, true, false, false);
    if (data) return data;

    // All objects matching artist
    const data2 = await searchArtworks(true, false, true, false);
    if (data2) return data2;

    // All objects matching tags
    const data3 = await searchArtworks(true, false, false, true);
    if (data3) return data3;

    // Only use query
    const data4 = await searchArtworks(true, false, false, false);
    if (data4) return data4;

    // If no objects found, return null
    return null;
}

// Dropping isHighlight for now, produces limited results
// Also dropping isOnView because I can't get that data for the individual object
// Again, thanks Eric!
async function searchArtworks(hasImages, title, artistOrCulture, tags) {
    const url = new URL('https://collectionapi.metmuseum.org/public/collection/v1/search?');

    if (hasImages) {
        url.searchParams.append('hasImages', 'true')
    }

    if (title) {
        url.searchParams.append('title', 'true')
    }

    if (artistOrCulture) {
        url.searchParams.append('artistOrCulture', 'true')
    }

    if (tags) {
        url.searchParams.append('tags', 'true')
    }

    url.searchParams.append('q', searchName)




    return fetch(url).then(res => res.json())
        .then(data => {
            console.log(data);
            // if array length > 1, return random object ID from array
            if (data.objectIDs.length > 1) {

                removeDuds(data.objectIDs); // this works but it's way too slow.

                let randomIndex = Math.floor(Math.random() * data.objectIDs.length);
                return data.objectIDs[randomIndex];
            }

            // if array length = 1, return object ID
            if (data.objectIDs.length === 1) {
                return data.objectIDs[0];
            }

            // if array length = 0, return null
            if (data.objectIDs.length === 0) {
                displayNoMatchMessage(searchName);
                return null;
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Function to get metadata from object ID
// Thanks Jonny and GPT for appendChild
async function getObjectInfo(objectID) {
    const url = new URL('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + objectID);
    return fetch(url)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);

            // If data.message is undefined, run displayOldMatchMessage
            if (data.message = 'Not a valid object' && !data.artistDisplayName && !data.artistDisplayBio && !data.title && !data.objectDate && !data.medium && !data.objectURL) {
                displayOldMatchMessage();
                return;
            }

            // Create a new Div for the metadata
            let artworkInfo = document.createElement('div');
            artworkInfo.setAttribute('class', 'artwork-info ');

            // Grab primaryImage and make it BG Image
            console.log(data.primaryImage);
            let bgImage = document.getElementById('bg-image');
            bgImage.style.backgroundImage = `url(${data.primaryImage})`;


            // If there is no primaryImage, display a message to click through for images
            if (!data.primaryImage) {
                let statusMessage = document.createElement('p');
                statusMessage.setAttribute('class', 'alert-red');
                statusMessage.innerHTML = 'Click through for images';
                artworkInfo.appendChild(statusMessage);
            }

            // Create a div element for artist name and bio
            let artistInfo = document.createElement('div');
            artistInfo.setAttribute('class', 'artist-info');

            let artistName = document.createElement('h2');
            artistName.innerHTML = data.artistDisplayName;
            // artistName.setAttribute('class', 'typed');
            artistInfo.appendChild(artistName); // Append artistName to artistInfo div

            let artistBio = document.createElement('p');
            artistBio.innerHTML = data.artistDisplayBio;
            // artistBio.setAttribute('class', 'typed');
            artistInfo.appendChild(artistBio); // Append artistBio to artistInfo div

            artworkInfo.appendChild(artistInfo); // Append artistInfo div to artworkInfo div

            // Create a h1 element for the title
            let title = document.createElement('h1');
            title.setAttribute('class', 'title')
            title.innerHTML = data.title;
            artworkInfo.appendChild(title); // Append the title to the artworkInfo div


            // Create a div element for the medium and date
            let didactic = document.createElement('div');
            didactic.setAttribute('class', 'didactic');

            let objectDate = document.createElement('p');
            // objectDate.setAttribute('class', 'typed');
            objectDate.innerHTML = data.objectDate;
            didactic.appendChild(objectDate); // Append objectDate to didactic div

            let medium = document.createElement('p');
            // medium.setAttribute('class', 'typed');
            medium.innerHTML = data.medium;
            didactic.appendChild(medium); // Append medium to didactic div

            // Credit (Provenance)
            let credit = document.createElement('p');
            // credit.setAttribute('class', 'typed');
            credit.innerHTML = data.creditLine;
            didactic.appendChild(credit);


            artworkInfo.appendChild(didactic); // Append didactic div to artworkInfo div

            // Create learn more button linking to objectURL
            let learnMore = document.createElement('a');
            learnMore.setAttribute('class', 'btn-outline');
            learnMore.setAttribute('href', data.objectURL);
            learnMore.innerHTML = 'Learn More'; // Set the button text
            artworkInfo.appendChild(learnMore); // Append learnMore to artworkInfo div

            //create button to refresh page
            let refresh = document.createElement('button');
            refresh.setAttribute('class', 'button');
            refresh.setAttribute('onclick', 'refresh()');
            refresh.innerHTML = '← Start Again'; // Set the button text
            artworkInfo.appendChild(refresh); // Append refresh to artworkInfo div

            // Append the artworkInfo div the 'results' section
            let resultsSection = document.getElementById('results');
            resultsSection.appendChild(artworkInfo);

            // Set #results to min-height 90vh
            resultsSection.style.minHeight = '90vh';


            // Remove the search elements
            removeSearch();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


// Function to remove search elements before displaying results
function removeSearch() {
    const element = document.getElementById('main');
    element.remove();
}

function refresh() {
    location.reload();
}

function displayNoMatchMessage(searchName) {
    // Create a new Div for the message
    let noMatchMessage = document.createElement('div');
    noMatchMessage.setAttribute('class', 'artwork-info');

    // Create an h1 element for the title
    let title = document.createElement('h1');
    title.setAttribute('class', 'title')
    title.innerHTML = `I'm afraid ${searchName} is not in the Met... yet.`;
    noMatchMessage.appendChild(title); // Append the title to the noMatchMessage div

    // Create a message element
    let message = document.createElement('p');
    message.innerHTML = `Maybe it'll be you? We're waiting patiently for your masterpiece.`;
    noMatchMessage.appendChild(message); // Append the message to the noMatchMessage div

    //create button to refresh page
    let refresh = document.createElement('button');
    refresh.setAttribute('class', 'button');
    refresh.setAttribute('onclick', 'refresh()');
    refresh.innerHTML = '← Start Again'; // Set the button text
    noMatchMessage.appendChild(refresh); // Append refresh to artworkInfo div

    // Append the noMatchMessage div to the 'results' section
    let resultsSection = document.getElementById('results');
    resultsSection.appendChild(noMatchMessage);

    // Remove the search elements
    removeSearch();
}

function displayOldMatchMessage() {
    // Create a new Div for the message
    let noMatchMessage = document.createElement('div');
    noMatchMessage.setAttribute('class', 'artwork-info');

    // Create an h1 element for the title
    let title = document.createElement('h1');
    title.setAttribute('class', 'title')
    title.innerHTML = `${searchName} used to be in the Met, but no longer.`;
    noMatchMessage.appendChild(title); // Append the title to the noMatchMessage div

    // Create a message element
    let message = document.createElement('p');
    message.innerHTML = `This is awkward... We're able to find a matching record, but it's empty. How mysterious! Was it stolen? Did it burn down in a great fire? Perhaps you know the legend.`;
    noMatchMessage.appendChild(message); // Append the message to the noMatchMessage div

    //create button to refresh page
    let refresh = document.createElement('button');
    refresh.setAttribute('class', 'button');
    refresh.setAttribute('onclick', 'refresh()');
    refresh.innerHTML = '← Start Again'; // Set the button text
    noMatchMessage.appendChild(refresh); // Append refresh to artworkInfo div

    // Append the noMatchMessage div to the 'results' section
    let resultsSection = document.getElementById('results');
    resultsSection.appendChild(noMatchMessage);

    // Remove the search elements
    removeSearch();
}

// Make Results section 85vh by setting the class to 'results
function popResults() {
    let resultsSection = document.getElementById('results');
    resultsSection.setAttribute('class', 'results');
}

function loading() {
    popResults();

    // create full screen overlay
    let overlay = document.createElement('div');
    overlay.setAttribute('id', 'overlay');
    overlay.setAttribute('class', 'overlay');

    // create loading div
    let loading = document.createElement('p');
    loading.setAttribute('class', 'loading');
    loading.innerHTML = 'Searching for ' + searchName + '...';

    // append loading div to overlay
    overlay.appendChild(loading);

    document.body.appendChild(overlay);
}

function removeloading() {
    let overlay = document.getElementById('overlay');
    // overlay.setAttribute('class', 'overlay fadeOut');
    overlay.remove();
}

function removeDuds(array) {
    // display loading message
    loading();

    // Go through each item, check if message is undefined, if so remove it from the array
    for (let i = 0; i < array.length; i++) {
        let objectID = array[i];
        const url = new URL('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + objectID);
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.message = 'Not a valid object' && !data.artistDisplayName && !data.artistDisplayBio && !data.title && !data.objectDate && !data.medium && !data.objectURL) {
                    array.splice(i, 1);
                    console.log('removing ' + objectID);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    // remove loading message
    removeloading();

    return array;
}