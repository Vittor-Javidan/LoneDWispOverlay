const chatBoxHideButton = document.getElementById('chatbox-hide-button');
const chatContainer = document.getElementById('chatbox')

chatBoxHideButton.addEventListener('click', () => {

  chatContainer.classList.toggle('no-chat')
  
  if(chatBoxHideButton.innerText === 'Hide') {
    chatBoxHideButton.innerText = 'Show'
    return
  }

  chatBoxHideButton.innerText = 'Hide'
});