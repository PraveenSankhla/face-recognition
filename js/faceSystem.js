$(document).ready(function(){
    async function face(){
        let video = document.querySelector("#video");
        let click_button = document.querySelector("#click-photo");
        let canvasforimg = document.querySelector("#canvas");
        let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;      
        
        click_button.addEventListener('click', async function() {
            canvasforimg.getContext('2d').drawImage(video, 0, 0, canvasforimg.width, canvasforimg.height);
            let image_data_url = canvasforimg.toDataURL('image/jpeg');

        const MODEL_URL = '/models'
        await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceapi.loadFaceLandmarkModel(MODEL_URL)
        await faceapi.loadFaceRecognitionModel(MODEL_URL)
        await faceapi.loadFaceExpressionModel(MODEL_URL)

        const img= document.getElementById('originalImg');
        const newImage = new Image();
        newImage.onload = function() {
            img.src = newImage.src;
        }
        newImage.src = image_data_url;
        let faceDescriptions = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
        const canvas = $('#reflay').get(0)
        faceapi.matchDimensions(canvas, img)

        //faceDescriptions = faceapi.resizeResults(faceDescriptions, img)
        faceapi.draw.drawDetections(canvas, faceDescriptions)
        faceapi.draw.drawFaceLandmarks(canvas, faceDescriptions)
        //faceapi.draw.drawFaceExpressions(canvas, faceDescriptions)

        const labels = ['AmitShah', 'NarendraModi', 'PraveenSankhla']

        const labeledFaceDescriptors = await Promise.all(
            labels.map(async label => {
                
                
                const imgUrl = `/Img/${label}.jpg`
                const img = await faceapi.fetchImage(imgUrl)
                
                const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                
                if (!faceDescription) {
                throw new Error(`no faces detected for ${label}`)
                }
                
                const faceDescriptors = [faceDescription.descriptor]
                return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
            })
        );

        const threshold = 0.6
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold)

        const results = faceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))

        results.forEach((bestMatch, i) => {
            const box = faceDescriptions[i].detection.box
            const text = bestMatch.toString()
            const drawBox = new faceapi.draw.DrawBox(box, { label: text })
            drawBox.draw(canvas)
        })
        });
    }
    
    face()
})