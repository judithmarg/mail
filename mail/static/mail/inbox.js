document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = submit_mail;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function submit_mail(){
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${recipients}`,
        subject: `${subject}`,
        body: `${body}`
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });
  load_mailbox('sent');
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  <ul id='emails-ul'></ul><ul id='email-ul'></ul>`;
  console.log(mailbox);
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      const listEmails = document.querySelector('#emails-ul');
      const infoEmail = document.querySelector('#email-ul');
      listEmails.innerHTML = '';
      emails.forEach(email => {
        const li = document.createElement('li');
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const div3 = document.createElement('div');
        div1.innerHTML = email.sender;
        div2.innerHTML = email.subject;
        div3.innerHTML = email.timestamp;
        li.append(div1, div2, div3);
        li.style.backgroundColor = email.read ? 'rgb(217,222,217)': 'white';
        li.addEventListener('click', function(){
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email_selected => {
            console.log(email);
            document.querySelector('#emails-ul').style.display = 'none';
            const from = document.createElement('div');
            from.innerHTML = `<b>From:</b> ${email_selected.sender}`;
            const to = document.createElement('div');
            const allRecipients =email_selected.recipients;
            const recipientsRef = allRecipients.join(',');
            to.innerHTML = `<b>To:</b> ${recipientsRef}`;
            const subject = document.createElement('div');
            subject.innerHTML = `<b>Subject:</b> ${email_selected.subject}`;
            const timestamp = document.createElement('div');
            timestamp.innerHTML = `<b>Timestamp:</b> ${email_selected.timestamp}`;
            const body = email_selected.body;
            infoEmail.append(from);
            infoEmail.append(to);
            infoEmail.append(subject);
            infoEmail.append(timestamp);
            infoEmail.append(body);
          })
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        })
        listEmails.append(li);
        if(mailbox === 'inbox' && !email.archived){
          const button = document.createElement('div');
          button.innerHTML = `<button class="btn btn-sm btn-outline-primary">Archive</button>`
          button.addEventListener('click', () => {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
          })
          listEmails.append(button);
        }else if(mailbox === 'archive' && email.archived){
          const button = document.createElement('div');
          button.innerHTML = `<button class="btn btn-sm btn-outline-primary">Unarchive</button>`
          button.addEventListener('click', () => {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then(load_mailbox('inbox'))
          }
          )
          listEmails.append(button);
        }
      })
  });

}