pipeline {
    agent any

    stages {
        stage('Install Trivy') {
            steps {
                sh '''
                    wget https://github.com/aquasecurity/trivy/releases/download/v0.41.0/trivy_0.41.0_Linux-64bit.deb
                    sudo dpkg -i trivy_0.41.0_Linux-64bit.deb
                    rm trivy_0.41.0_Linux-64bit.deb
                '''
            }
        }

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

        stage ('TRIVY SCAN'){
            steps{
                sh "trivy fs --security-checks vuln,config /var/jenkins_home/workspace/todo-app/todo"
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
