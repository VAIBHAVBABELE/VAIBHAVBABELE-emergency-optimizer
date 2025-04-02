/**
 * Disaster API Service - Handles all disaster-related API calls
 */
class DisasterService {
    // Get token from localStorage (set by auth.php after login)
    static getToken() {
        return localStorage.getItem('authToken') || '';
    }

    // Fetch all disasters
    static async getAll() {
        const response = await fetch('/backend/api/disasters.php', {
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    // Create new disaster
    static async create(disasterData) {
        const response = await fetch('/backend/api/disasters.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(disasterData)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    // Update disaster
    static async update(id, updates) {
        const response = await fetch(`/backend/api/disasters.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }

    // Delete (archive) disaster
    static async delete(id) {
        const response = await fetch(`/backend/api/disasters.php?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    }
}