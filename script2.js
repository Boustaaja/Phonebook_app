(loadPage = () => {
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => {
      displayUser(data);
    });
})();

const userDisplay = document.querySelector(".table"); //haetaan taulukko elementti

displayUser = (data) => {
  userDisplay.innerHTML = `
      <thead>
      <tr>
          <th>Id</th>
          <th>Nimi</th>
          <th>Puhelin</th>
          <th>Poista</th>
          <th>Muokkaa</th>
      </tr>  
      </thead> 
      <tbody id="table-body"></tbody> 
      `;
  displayRow(data);
};

displayRow = (data) => {
  const tableBody = document.getElementById("table-body"); // Haetaan tbody
  tableBody.innerHTML = ""; // Tyhjennetään vanhat rivit ennen uusien lisäämistä

  data.forEach((user) => {
    tableBody.innerHTML += `
          <tr>
              <td>${user.id}</td>
              <td>${user.nimi}</td>
              <td id="phone-${user.id}">${user.puhelin}</td>
              <td><input type="button" onClick="removeRow(${user.id})" value="X" style="background-color: grey; color: black; font-weight: bold; border: 2px solid black; padding: 5px 12px;"/></td>
              <td><button class="btn btn-warning" onClick="enableEdit(${user.id})">Muokkaa</button></td>                    
          </tr>
          `;
  });
};

// Tehdään puhelinnumerosta muokattava
function enableEdit(id) {
  let phoneCell = document.getElementById(`phone-${id}`);
  let oldValue = phoneCell.innerText;

  phoneCell.innerHTML = `
      <input type="text" id="edit-phone-${id}" value="${oldValue}"/>
      <button class="btn btn-warning" onclick="updateRow(${id})">Tallenna</button>
  `;
}
// Metodi taulukon rivin poistamiseen id:n perusteella.
removeRow = async (id) => {
  console.log(id);
  let polku = "http://localhost:3000/items/" + id;

  await fetch(polku, { method: "DELETE" }).then(() =>
    console.log("poisto onnistui")
  );

  //ladataan sivu uudelleen - Tä oli huono tapa: pitäisi päivittää vain joku alue sivusta
  await loadPage();
};

// Metodi puhelinnumeron päivittämiseen
updateRow = async (id) => {
  console.log(id);

  let newPhone = document.getElementById(`edit-phone-${id}`).value;
  let polku = "http://localhost:3000/items/" + id;

  // haetaan käyttäjän tiedot
  let response = await fetch(polku);
  let userData = await response.json();

  // Päivitetään uusi puhelinnumero, sekä käytetään id ja nimeen vanhoja tietoja.
  let updatedData = {
    id: userData.id,
    nimi: userData.nimi,
    puhelin: newPhone,
  };
  await fetch(polku, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });

  // Päivitetään taulukko ilman sivun latausta
  let phoneCell = document.getElementById(`phone-${id}`);
  phoneCell.innerText = newPhone;

  console.log("Päivitys onnistui:", updatedData);
};

async function postFormDataAsJson({ url, formData }) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: formDataJsonString,
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return response.json();
}

async function handleFormSubmit(event) {
  event.preventDefault(); //estää lomakkeen lähettämisen eli estää lomakkeen oletustapahtuman

  const form = event.currentTarget; //tapahtuman kohde eli lomake
  const url = form.action; //lomakkeen action eli minne lomake lähetetään

  try {
    const formData = new FormData(form); //luodaan uusi FormData olio ja annetaan sille lomake
    const responseData = await postFormDataAsJson({ url, formData }); //lähetetään lomake fetchillä
    await loadPage(); //ladataan sivu uudelleen
    console.log({ responseData });
  } catch (error) {
    console.error(error);
  }
}

const exampleForm = document.getElementById("puhelintieto_lomake"); //haetaan lomake
exampleForm.addEventListener("submit", handleFormSubmit); //kuunnellaan lomakkeen lähettämistä
