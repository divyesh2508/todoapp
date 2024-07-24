pipeline {
    agent any

    environment {
        IMAGE_NAME = "todo-app"
        IMAGE_TAG = "latest"
        AWS_REGION = "ap-south-1"
        AWS_DEFAULT_REGION = "ap-south-1"
        AWS_ACCOUNT_URL = "https://910253526187.dkr.ecr.ap-south-1.amazonaws.com"
        INSTANCE_IP = '13.200.160.5'
        SONARQUBE_SERVER = 'SonarQube'  // Name of the SonarQube server as configured in Jenkins
        SONARQUBE_TOKEN = 'squ_168a793386e0b0b5951d56208e7c4a360ef79ac8'  // The token generated from SonarQube
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building'
                script {
                    def myImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    docker.withRegistry("${AWS_ACCOUNT_URL}", "ecr:${AWS_DEFAULT_REGION}:aws-creds") {
                        myImage.push("${IMAGE_TAG}")
                    }
                    echo "${env.GIT_BRANCH}"
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                echo 'Running Trivy Scan'
                script {
                    // Ensure Trivy is installed and run the scan
                    sh '''
                        if ! command -v trivy &> /dev/null
                        then
                            echo "Trivy could not be found, installing..."
                            apt-get update && apt-get install -y wget
                            wget https://github.com/aquasecurity/trivy/releases/download/v0.41.0/trivy_0.41.0_Linux-64bit.deb
                            dpkg -i trivy_0.41.0_Linux-64bit.deb
                        fi
                        trivy image --severity HIGH,CRITICAL ${AWS_ACCOUNT_URL}/${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube Analysis'
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['todo-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no 'jenkins'@$INSTANCE_IP "sh /apps/deploy-todo-app.sh"
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
