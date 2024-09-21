import createRequest from './api/createRequest';
import createFileRequest from './api/createFileRequest';
import randomizer from './api/randomizer';

export default class Bot {
    constructor() {
        this.containerContent = document.querySelector('.container-content');
        this.geoBtn = document.querySelector('.header-geo');
        this.messageInput = document.querySelector('.footer-messageInput');
        this.enterBtn = document.querySelector('.footer-enterBtn');
        this.uploadFile = document.querySelector('.footer-uploadFile');
        this.uploadFileInput = this.uploadFile.querySelector('.overlapped');
        this.recordAudio = document.querySelector('.header-recordAudio');
        this.recordVideo = document.querySelector('.header-recordVideo');
        this.recordAudioContainer = document.querySelector('.header-recordContainer');
        this.deleteBtn = document.querySelector('.header-deleteMessages');
    }


    init() {
        this.addTextListener();
        this.addFileListener();
        this.geolocationListener();
        this.audioRecordListener();
        this.videoRecordListener();
        this.deleteBtnListener();
        this.allMessagesLoaded = false;
        this.loadMessages();
        this.setupScrollListener();
        this.pinListener();
    }

    addTextListener() {
        const addText = () => {
            if (this.messageInput.value !== '' || this.messageInput.value !== undefined) {
                const data = {
                    value: this.messageInput.value,
                    type: 'text',
                    method: 'createTextMessage',
                    requestMethod: 'POST'
                }
                const response = createRequest(data);
                if (response) {
                    response.then(res => {
                        const textResponse = res.responseMessage;
                        this.addTextMessage(textResponse);
                        this.chaos(textResponse);
                    })
                }
                this.messageInput.value = '';
            }
        }

        this.enterBtn.addEventListener('click', () => {
            addText();
        })

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                addText();
            }
        })
    }

    addFileListener() {
        this.uploadFile.addEventListener('click', (e) => {
          this.uploadFileInput.dispatchEvent(new MouseEvent('click'));
        });
      
        this.dndFile();
      
        this.uploadFileInput.addEventListener('change', (e) => {
          const file = this.uploadFileInput.files[0];
          if (!file) return;
      
          const fileType = file.type.split('/')[0];
          const data = new FormData();
          data.append('file', file);
          data.append('fileType', fileType);
          data.append('method', 'createFileMessage');
          data.append('requestMethod', 'POST');
      
          createFileRequest(data).then(res => {
            console.log(res.responseMessage);
            const fileResponse = res.responseMessage;
            this.addContent(fileResponse, fileType);
          });
        });
      }

    dndFile() {
        this.containerContent.addEventListener('dragover', (e) => {
            e.preventDefault();
        })

        this.containerContent.addEventListener('drop', (e) => {
            e.preventDefault();

            const file = e.dataTransfer.files[0];
            const fileType = file.type.split('/')[0];
            if (!file) return;

      
          const data = new FormData();
          data.append('file', file);
          data.append('fileType', fileType);
          data.append('method', 'createFileMessage');
          data.append('requestMethod', 'POST');
      
          createFileRequest(data).then(res => {
            console.log(res.responseMessage);
            const fileResponse = res.responseMessage;
            this.addContent(fileResponse, fileType);
          });
        })
    }

    addContent(fileData, fileType, prepend = false) {
        let contentElement;
      
        const byteArray = new Uint8Array(fileData.value);
        const blob = new Blob([byteArray], { type: fileData.fileType });
        const file = new File([blob], fileData.filename, {
          type: fileData.fileType,
          lastModified: fileData.lastModified,
        });
      
        if (fileType === 'audio') {
          contentElement = document.createElement('audio');
          contentElement.controls = true;
          contentElement.src = URL.createObjectURL(file);
        } else if (fileType === 'video') {
          contentElement = document.createElement('video');
          contentElement.controls = true;
          contentElement.src = URL.createObjectURL(file);
        } else {
          contentElement = document.createElement('img');
          contentElement.src = URL.createObjectURL(file);
        }
      
        contentElement.className = 'content-' + fileType;
      
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content-' + 'file' + 'Container';
        contentContainer.append(contentElement);
      
        if (prepend) {
            this.containerContent.prepend(contentContainer);
        } else {
            this.containerContent.append(contentContainer);
        }
      }

    addTextMessage(message, prepend = false) {
        if (message === '') {
            return;
        }

        const messageBox = document.createElement('div');
        messageBox.className = 'content-message';

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = message.match(urlRegex);
        const textParts = message.split(urlRegex);

        messageBox.innerHTML = '';

        textParts.forEach((text, index) => {
            if (index === 0) {
            messageBox.appendChild(document.createTextNode(text));
            } else {
            const anchor = document.createElement('a');
            anchor.href = match[index - 1];
            anchor.textContent = match[index - 1];
            anchor.target = '_blank';
            messageBox.appendChild(anchor);
            }
        });

        if (prepend) {
            this.containerContent.prepend(messageBox);
        } else {
            this.containerContent.append(messageBox);
        }
    }

    chaos(message) {
        if (message === '@chaos: погода') {
            const answer = randomizer();
            const data = {
                value: answer,
                type: 'text',
                method: 'createTextMessage',
                requestMethod: 'POST'
            }
            const response = createRequest(data);
            if (response) {
                response.then(res => {
                    const textResponse = res.responseMessage;
                    this.addTextMessage(textResponse);
                })
            }
        }
    }

    async navigator() {
        if (navigator.geolocation) {
            try {
                const data = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                });
                const { latitude, longitude } = data.coords;
                const requestData = {
                    latitude,
                    longitude,
                    type: 'coords',
                    method: 'createGeoMessage',
                    requestMethod: 'POST'
                }
                const response = createRequest(requestData);
                if (response) {
                    response.then(res => {
                        const responseLatitude = res.responseLatitude;
                        const responseLongitude = res.responseLongitude;
                        const geolocationData = document.createElement('div');
                        geolocationData.textContent = `[${responseLatitude}, ${responseLongitude}]`;
                        geolocationData.className = 'content-message';
                
                        this.containerContent.append(geolocationData);
                    })
                }                
            } catch (err) {
                console.log(err);
            }
        }
    }

    async geolocation() {
            await this.navigator();
            return;
 
    }

    geolocationListener() {
        this.geoBtn.addEventListener('click', () => {
            this.geolocation();
        })
    }

    audioRecordListener() {
        let mediaRecorder;
        let audioChunks = [];
        let mediaStream; 
    
        const startRecording = () => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        mediaStream = stream; 
                        mediaRecorder = new MediaRecorder(stream);
    
                        mediaRecorder.addEventListener('dataavailable', event => {
                            audioChunks.push(event.data);
                        });
    
                        mediaRecorder.addEventListener('stop', () => {
                            if (audioChunks.length > 0) {
                                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                                const audioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
    
                                const data = new FormData();
                                data.append('file', audioFile);
                                data.append('fileType', 'audio');
                                data.append('method', 'createFileMessage');
                                data.append('requestMethod', 'POST');
    
                                createFileRequest(data).then(res => {
                                    const fileResponse = res.responseMessage;
                                    this.addContent(fileResponse, 'audio');
                                });
                                mediaStream.getTracks().forEach(track => track.stop());
                            }
    
                            audioChunks = [];
                        });
    
                        mediaRecorder.start();
                        this.recordAudio.classList.add('record-active');
                    })
                    .catch(error => {
                        console.error('Error accessing media devices.', error);
                    });
            } else if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
            }
        };
    
        const stopRecording = () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                this.recordAudio.classList.remove('record-active');
            }
        };
    
        this.recordAudio.addEventListener('click', () => {
            if (this.recordAudio.classList.contains('record-active')) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }
    
    videoRecordListener() {
        let mediaRecorder;
        let videoChunks = [];
        let mediaStream; 
    
        const startRecording = () => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then(stream => {
                        mediaStream = stream; 
                        mediaRecorder = new MediaRecorder(stream);
    
                        mediaRecorder.addEventListener('dataavailable', event => {
                            videoChunks.push(event.data);
                        });
    
                        mediaRecorder.addEventListener('stop', () => {
                            if (videoChunks.length > 0) {
                                const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
                                const videoFile = new File([videoBlob], 'recorded_video.webm', { type: 'video/webm' });
    
                                const data = new FormData();
                                data.append('file', videoFile);
                                data.append('fileType', 'video');
                                data.append('method', 'createFileMessage');
                                data.append('requestMethod', 'POST');
    
                                createFileRequest(data).then(res => {
                                    const fileResponse = res.responseMessage;
                                    console.log(fileResponse);
                                    this.addContent(fileResponse, 'video');
                                });
                                mediaStream.getTracks().forEach(track => track.stop());
                            }
    
                            videoChunks = [];
                        });
    
                        mediaRecorder.start();
                        this.recordVideo.classList.add('record-active');
                    })
                    .catch(error => {
                        console.error('Error accessing media devices.', error);
                    });
            } else if (mediaRecorder.state === 'paused') {
                mediaRecorder.resume();
            }
        };
    
        const stopRecording = () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                this.recordVideo.classList.remove('record-active');
            }
        };
    
        this.recordVideo.addEventListener('click', () => {
            if (this.recordVideo.classList.contains('record-active')) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }
    

    deleteBtnListener() {
        this.deleteBtn.addEventListener('click', () => {
            const data = {
                value: 'deleteMessages',
                method: 'deleteMessages',
                requestMethod: 'POST'
            };
            createRequest(data).then(res => {
                if (res.responseMessage === 'success') {
                    this.containerContent.innerHTML = '';
                } else {
                    console.log('error with deleting messagges')
                }
            });
        })
    }

    loadMessages(offset = 0, limit = 10) {
        const data = {
            requestMethod: 'GET',
            offset: offset,
            limit: limit
        };
    
        createRequest(data).then(res => {
            if (res.length > 0) {
                res.forEach(element => {
                    if (element.type === 'text') {
                        this.addTextMessage(element.value, true);
                    }
                    if (element.fileType === 'audio' || element.fileType === 'video' || element.fileType === 'image') {
                        this.addContent(element, element.fileType, true);
                    }
                    if (element.type === 'coords') {
                        const geolocationData = document.createElement('div');
                        geolocationData.textContent = `[${element.latitude}, ${element.longitude}]`;
                        geolocationData.className = 'content-message';
                        this.containerContent.prepend(geolocationData);
                    }
                });
    
                if (res.length < limit) {
                    this.allMessagesLoaded = true;
                }
            } else {
                this.allMessagesLoaded = true;
            }
        });
    }

    setupScrollListener() {
        this.containerContent.addEventListener('scroll', () => {
            if (this.containerContent.scrollTop === 0 && !this.allMessagesLoaded) {
                const currentMessagesCount = this.containerContent.childElementCount;
                this.loadMessages(currentMessagesCount, 10);
            }
        });
    }
    
    pinListener() {
        this.containerContent.addEventListener('contextmenu', (event) => {
            if (event.target.classList.contains('content-message') || event.target.parentElement.classList.contains('content-fileContainer')) {
                event.preventDefault();
                this.showContextMenu(event.pageX, event.pageY, event.target);
            }
        });

        document.addEventListener('click', (event) => {
            const contextMenu = document.getElementById('contextMenu');
            if (contextMenu && !contextMenu.contains(event.target)) {
                contextMenu.style.display = 'none';
            }
        });
    }

    showContextMenu(x, y, targetElement) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        contextMenu.addEventListener('click', (event) => {
            if (event.target.classList.contains('context-menu__item')) {
                if (event.target.textContent === 'Pin') {
                    console.log('Pinned item');
                    this.pinItem(targetElement);
                    console.log(targetElement);
                }
                if (event.target.textContent === 'Close') {
                    console.log('Closed item')
                    contextMenu.style.display = 'none';

                }
            }
        }, { once: true });
    }

    pinItem(item) {
        if (this.pinnedItemContainer) {
            this.pinnedItemContainer.remove();
        }

        const pinnedItemContainer = document.createElement('div');
        pinnedItemContainer.className = 'pinnedItemContainer';
        this.pinnedItemContainer = pinnedItemContainer;

        const pinnedItem = document.createElement('div');
        
        const deletePinnedItem = document.createElement('button');
        deletePinnedItem.innerHTML = '&#10005;';
        deletePinnedItem.className = 'deletePinnedItemBtn';
        this.deletePiinedItem = deletePinnedItem;

        pinnedItemContainer.append(pinnedItem);
        pinnedItemContainer.append(deletePinnedItem);

        if (item.classList.contains('content-message')) {
            pinnedItem.innerHTML = '&#128190; &nbsp;'+ item.textContent.slice(0, 40) + '...';
            this.pinnedItem = item;
        } else {
            pinnedItem.innerHTML = '&#128190; &nbsp; Saved file';
            this.pinnedItem = item;
        }
        this.scrollToPinnedItem();
        this.containerContent.prepend(pinnedItemContainer);
    }
    
    scrollToPinnedItem() {
        this.pinnedItemContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('deletePinnedItemBtn')) {
                this.pinnedItemContainer.remove();
                return;
            }

            this.pinnedItem.scrollIntoView({ behavior: 'smooth' });
            
            highlightElement(this.pinnedItem);
    
            function highlightElement(element) {
                element.classList.add('highlightPinnedMessage');
                setTimeout(() => {
                    element.classList.remove('highlightPinnedMessage');
                }, 2000); 
            }

        })
    }
 }