
class Sdk {
    apiUrl: string;
    constructor({ apiUrl }) {
        this.apiUrl = apiUrl;
        console.log(this.apiUrl)
    }

    async getRoom(id) {
        return this.apiCall(`/rooms/${id}`, {}).then(res => res.ok ? res.json() : this.handleError(res))
    }

    async createRoom(room) {
        return this.apiCall('/rooms', {
            method: "POST",
            body: JSON.stringify(room),
        }).then(res => res.ok ? res.json() : this.handleError(res))
    }

    async sendOffer(roomId, offer) {
        return this.apiCall(`/rooms/${roomId}/offer`, {
            method: "POST",
            body: {
                offer
            },
        }).then(res => res.ok ? res.json() : this.handleError(res))
    }

    async answerOffer(roomId, offerId, answer) {
        return this.apiCall(`/rooms/${roomId}/${offerId}/answer`, {
            method: "POST",
            body: JSON.stringify({
                answer
            }),
        }).then(res => res.ok ? res.json() : this.handleError(res))
    }

    
    async resolveAnswer(roomId, offerId, answer) {
        return this.apiCall(`/rooms/${roomId}/${offerId}/resolve`, {
            method: "POST",
            body: JSON.stringify({
                answer
            }),
        }).then(res => res.ok ? res.json() : this.handleError(res))
    }

    

    private async handleError(res) {
        if (res.status < 500) {
            try {
                const result = await res.json();
                throw new Error(result.error);
            }
            catch (e) {
                console.error(e);
                throw new Error("Unexpected result")
            }
        } else {
            throw new Error("Unexpected result")
        }
    }

    private async apiCall(path, options: any = {}) {
        return fetch(this.apiUrl + '/v1' + path, {
            headers: {
                'content-type': 'application/json',
                ...options.headers,
            },
            ...options,
        })
    }
}

export default Sdk