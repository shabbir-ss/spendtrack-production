#!/usr/bin/env node

/**
 * Comprehensive API Test Script
 * Tests all authentication and planner APIs
 */

const API_BASE = 'http://localhost:3000/api';

class ApiTester {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.userId = null;
        this.testResults = [];
    }

    async makeRequest(method, endpoint, data = null, useAuth = true) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };

        if (useAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const config = {
            method,
            headers,
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json().catch(() => ({}));

            return {
                ok: response.ok,
                status: response.status,
                data: responseData,
            };
        } catch (error) {
            return {
                ok: false,
                status: 0,
                error: error.message,
            };
        }
    }

    log(test, status, message) {
        const result = { test, status, message, timestamp: new Date().toISOString() };
        this.testResults.push(result);
        console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
    }

    async testRegister() {
        console.log('\n🔐 Testing User Registration...');

        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            mobile: '+1234567890',
            password: 'testpassword123',
            emailNotifications: true,
            smsNotifications: false,
        };

        const result = await this.makeRequest('POST', '/auth/register', userData, false);

        if (result.ok && result.data.accessToken) {
            this.accessToken = result.data.accessToken;
            this.refreshToken = result.data.refreshToken;
            this.userId = result.data.user.id;
            this.log('Register', 'PASS', `User registered successfully with ID: ${this.userId}`);
            return true;
        } else {
            this.log('Register', 'FAIL', result.data.message || 'Registration failed');
            return false;
        }
    }

    async testLogin() {
        console.log('\n🔑 Testing User Login...');

        // First register a user for login test
        const userData = {
            name: 'Login Test User',
            email: `login${Date.now()}@example.com`,
            mobile: '+1234567891',
            password: 'logintest123',
        };

        await this.makeRequest('POST', '/auth/register', userData, false);

        // Now test login
        const loginData = {
            email: userData.email,
            password: userData.password,
        };

        const result = await this.makeRequest('POST', '/auth/login', loginData, false);

        if (result.ok && result.data.accessToken) {
            this.log('Login', 'PASS', 'User logged in successfully');
            return true;
        } else {
            this.log('Login', 'FAIL', result.data.message || 'Login failed');
            return false;
        }
    }

    async testRefreshToken() {
        console.log('\n🔄 Testing Token Refresh...');

        if (!this.refreshToken) {
            this.log('Refresh Token', 'SKIP', 'No refresh token available');
            return false;
        }

        const result = await this.makeRequest('POST', '/auth/refresh', { refreshToken: this.refreshToken }, false);

        if (result.ok && result.data.accessToken) {
            this.accessToken = result.data.accessToken;
            this.refreshToken = result.data.refreshToken;
            this.log('Refresh Token', 'PASS', 'Token refreshed successfully');
            return true;
        } else {
            this.log('Refresh Token', 'FAIL', result.data.message || 'Token refresh failed');
            return false;
        }
    }

    async testGetCurrentUser() {
        console.log('\n👤 Testing Get Current User...');

        const result = await this.makeRequest('GET', '/auth/me');

        if (result.ok && result.data.user) {
            this.log('Get Current User', 'PASS', `Retrieved user: ${result.data.user.name}`);
            return true;
        } else {
            this.log('Get Current User', 'FAIL', result.data.message || 'Failed to get current user');
            return false;
        }
    }

    async testCreatePlan() {
        console.log('\n📋 Testing Create Plan...');

        const planData = {
            name: 'Test Grocery Plan',
            description: 'Weekly grocery shopping',
            category: 'grocery',
            plannedDate: '2024-12-31',
            isTemplate: false,
        };

        const result = await this.makeRequest('POST', '/plans', planData);

        if (result.ok && result.data.id) {
            this.planId = result.data.id;
            this.log('Create Plan', 'PASS', `Plan created with ID: ${this.planId}`);
            return true;
        } else {
            this.log('Create Plan', 'FAIL', result.data.message || 'Failed to create plan');
            return false;
        }
    }

    async testGetPlans() {
        console.log('\n📋 Testing Get Plans...');

        const result = await this.makeRequest('GET', '/plans?isTemplate=false');

        if (result.ok && Array.isArray(result.data)) {
            this.log('Get Plans', 'PASS', `Retrieved ${result.data.length} plans`);
            return true;
        } else {
            this.log('Get Plans', 'FAIL', result.data.message || 'Failed to get plans');
            return false;
        }
    }

    async testGetPlanDetails() {
        console.log('\n📋 Testing Get Plan Details...');

        if (!this.planId) {
            this.log('Get Plan Details', 'SKIP', 'No plan ID available');
            return false;
        }

        const result = await this.makeRequest('GET', `/plans/${this.planId}`);

        if (result.ok && result.data.id) {
            this.log('Get Plan Details', 'PASS', `Retrieved plan details for: ${result.data.name}`);
            return true;
        } else {
            this.log('Get Plan Details', 'FAIL', result.data.message || 'Failed to get plan details');
            return false;
        }
    }

    async testAddPlanItem() {
        console.log('\n📦 Testing Add Plan Item...');

        if (!this.planId) {
            this.log('Add Plan Item', 'SKIP', 'No plan ID available');
            return false;
        }

        const itemData = {
            name: 'Rice',
            quantity: 5,
            unit: 'kg',
            rate: 2.50,
            notes: 'Basmati rice',
        };

        const result = await this.makeRequest('POST', `/plans/${this.planId}/items`, itemData);

        if (result.ok && result.data.id) {
            this.itemId = result.data.id;
            this.log('Add Plan Item', 'PASS', `Item added with ID: ${this.itemId}`);
            return true;
        } else {
            this.log('Add Plan Item', 'FAIL', result.data.message || 'Failed to add plan item');
            return false;
        }
    }

    async testUpdatePlanItem() {
        console.log('\n📦 Testing Update Plan Item...');

        if (!this.planId || !this.itemId) {
            this.log('Update Plan Item', 'SKIP', 'No plan or item ID available');
            return false;
        }

        const updateData = {
            name: 'Premium Rice',
            quantity: 10,
            unit: 'kg',
            rate: 3.00,
            notes: 'Premium Basmati rice',
        };

        const result = await this.makeRequest('PUT', `/plans/${this.planId}/items/${this.itemId}`, updateData);

        if (result.ok) {
            this.log('Update Plan Item', 'PASS', 'Item updated successfully');
            return true;
        } else {
            this.log('Update Plan Item', 'FAIL', result.data.message || 'Failed to update plan item');
            return false;
        }
    }

    async testUpdatePlan() {
        console.log('\n📋 Testing Update Plan...');

        if (!this.planId) {
            this.log('Update Plan', 'SKIP', 'No plan ID available');
            return false;
        }

        const updateData = {
            status: 'active',
        };

        const result = await this.makeRequest('PUT', `/plans/${this.planId}`, updateData);

        if (result.ok) {
            this.log('Update Plan', 'PASS', 'Plan updated successfully');
            return true;
        } else {
            this.log('Update Plan', 'FAIL', result.data.message || 'Failed to update plan');
            return false;
        }
    }

    async testCreateTemplate() {
        console.log('\n📋 Testing Create Template...');

        const templateData = {
            name: 'Weekly Grocery Template',
            description: 'Standard weekly grocery items',
            category: 'grocery',
            isTemplate: true,
            templateName: 'Weekly Grocery',
        };

        const result = await this.makeRequest('POST', '/plans', templateData);

        if (result.ok && result.data.id) {
            this.templateId = result.data.id;
            this.log('Create Template', 'PASS', `Template created with ID: ${this.templateId}`);
            return true;
        } else {
            this.log('Create Template', 'FAIL', result.data.message || 'Failed to create template');
            return false;
        }
    }

    async testGetTemplates() {
        console.log('\n📋 Testing Get Templates...');

        const result = await this.makeRequest('GET', '/plans?isTemplate=true');

        if (result.ok && Array.isArray(result.data)) {
            this.log('Get Templates', 'PASS', `Retrieved ${result.data.length} templates`);
            return true;
        } else {
            this.log('Get Templates', 'FAIL', result.data.message || 'Failed to get templates');
            return false;
        }
    }

    async testCreateFromTemplate() {
        console.log('\n📋 Testing Create Plan from Template...');

        if (!this.templateId) {
            this.log('Create from Template', 'SKIP', 'No template ID available');
            return false;
        }

        const data = {
            name: 'This Week Grocery',
            plannedDate: '2024-12-25',
        };

        const result = await this.makeRequest('POST', `/plans/${this.templateId}/create-from-template`, data);

        if (result.ok) {
            this.log('Create from Template', 'PASS', 'Plan created from template successfully');
            return true;
        } else {
            this.log('Create from Template', 'FAIL', result.data.message || 'Failed to create plan from template');
            return false;
        }
    }

    async testDeletePlanItem() {
        console.log('\n📦 Testing Delete Plan Item...');

        if (!this.planId || !this.itemId) {
            this.log('Delete Plan Item', 'SKIP', 'No plan or item ID available');
            return false;
        }

        const result = await this.makeRequest('DELETE', `/plans/${this.planId}/items/${this.itemId}`);

        if (result.ok) {
            this.log('Delete Plan Item', 'PASS', 'Item deleted successfully');
            return true;
        } else {
            this.log('Delete Plan Item', 'FAIL', result.data.message || 'Failed to delete plan item');
            return false;
        }
    }

    async testLogout() {
        console.log('\n🚪 Testing Logout...');

        const result = await this.makeRequest('POST', '/auth/logout');

        if (result.ok) {
            this.log('Logout', 'PASS', 'User logged out successfully');
            return true;
        } else {
            this.log('Logout', 'FAIL', result.data.message || 'Logout failed');
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive API Tests...\n');

        const tests = [
            () => this.testRegister(),
            () => this.testLogin(),
            () => this.testRefreshToken(),
            () => this.testGetCurrentUser(),
            () => this.testCreatePlan(),
            () => this.testGetPlans(),
            () => this.testGetPlanDetails(),
            () => this.testAddPlanItem(),
            () => this.testUpdatePlanItem(),
            () => this.testUpdatePlan(),
            () => this.testCreateTemplate(),
            () => this.testGetTemplates(),
            () => this.testCreateFromTemplate(),
            () => this.testDeletePlanItem(),
            () => this.testLogout(),
        ];

        let passed = 0;
        let failed = 0;
        let skipped = 0;

        for (const test of tests) {
            try {
                await test();
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
            } catch (error) {
                console.error(`❌ Test failed with error: ${error.message}`);
                failed++;
            }
        }

        // Count results
        this.testResults.forEach(result => {
            if (result.status === 'PASS') passed++;
            else if (result.status === 'FAIL') failed++;
            else if (result.status === 'SKIP') skipped++;
        });

        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
        }

        return { passed, failed, skipped };
    }
}

// Run tests
const tester = new ApiTester();
tester.runAllTests()
    .then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });